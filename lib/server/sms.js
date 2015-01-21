// Phone number for our twilio account.
var TWILIO_NUMBER = Meteor.settings.twilio.number;
// List of flavor phrases to insert at the beginning of confirmed messages.
var EXCLAMATIONS = ["Swell.", "Grand.", "Got it.", "Righty-o.", "Rockin'.",
  "Okie Dokie.", "Alright.", "Coolio."];
var EXCLAMATION_POS = {};
var getNextExclamation = function(user) {
  EXCLAMATION_POS[user._id] = ((EXCLAMATION_POS[user._id] || 0) + 1) % EXCLAMATIONS.length;
  return EXCLAMATIONS[EXCLAMATION_POS[user._id]] + " ";
}
var twilio = Meteor.npmRequire('twilio');
twilioClient = twilio(
  Meteor.settings.twilio.account_sid || '1234',
  Meteor.settings.twilio.auth_token || '1234'
);

function nth(num) {
  // convert zero-based index to 1-based and add suffix.
  return ["1st", "2nd", "3rd"][num] || ((num + 1) + "th");
}

// An object representing the state of a user's sms workflow -- e.g.  which
// question are we on, what the next question will be, etc.
function MessageState(smsWorkflow) {
  this.initialize(smsWorkflow);
};
MessageState.prototype.initialize = function(smsWorkflow, options) {
  this.smsWorkflow = smsWorkflow;
  if (!this.smsWorkflow.loops) {
    this.smsWorkflow.loops = {};
  }

  if (options && options.collection) {
    this.collection = options.collection;
  } else {
    var coll = global;
    _.each(smsWorkflow.collection.split("."), function(part) {
      coll = coll[part];
    });
    this.collection = coll;
  }
  if (options && options.obj) {
    this.obj = options.obj;
  } else {
    this.obj = this.collection.findOne(smsWorkflow.objectId);
  }

  var parents = [SMSWorkflows[smsWorkflow.workflow]];
  var step, i;
  // build a linked list of steps.
  if (smsWorkflow.path) {
    for (i = 0; i < smsWorkflow.path.length; i++) {
      if (!parents[i].steps) {
        // Invalid path!
        break;
      }
      step = parents[i].steps[smsWorkflow.path[i]];
      step.path = smsWorkflow.path.slice(0, i + 1);
      step.loopKey = this._loopKey(step.path);
      step.parent = parents[i];
      parents.push(step);
    }
  }
  this.step = step;
  this.def = this.step && this.step.field ? this._getFieldDef(step.field) : null;
};
MessageState.prototype.isDataEntryStep = function() {
  return this.step && (this.step.field || this.step.multipleBooleans);
};
MessageState.prototype.isSentinelStep = function() {
  return this.step && (this.step.loopn || this.step.branch);
};
MessageState.prototype._getFieldDef = function(field) {
  return SMSWorkflows[this.smsWorkflow.workflow].schema.getDefinition(field);
};
MessageState.prototype._loopKey = function(path) {
  return path.join("_");
};
MessageState.prototype._isLoopSentinel = function() {
  var loop = this.smsWorkflow.loops[this.step && this.step.loopKey];
  return loop && loop.pos < loop.total && (this.isSentinelStep());
};
MessageState.prototype._hasNextSibling = function() {
  var path = this.smsWorkflow.path;
  return (
    this.step && this.step.parent && this.step.parent.steps &&
    this.step.parent.steps.length - 1 > path[path.length - 1]
  );
};
MessageState.prototype._hasNextParentLoop = function() {
  var loop = this.smsWorkflow.loops[this.step && this.step.parent.loopKey];
  // Anticipate incrementing the loop, so go on (loop.total - 1).
  return !this._hasNextSibling() && loop && loop.pos < loop.total - 1;
};
MessageState.prototype._prevSiblingIsLoop = function() {
  if (!this._hasPrevSibling()) {
    return false;
  }
  // Find a loop designation for the previous sibling.
  var path = _.clone(this.smsWorkflow.path);
  path[path.length - 1] -= 1;
  var loopKey = this._loopKey(path);
  var loop = this.smsWorkflow.loops[loopKey]
  return loop && loop.total > 0;
};
MessageState.prototype._hasPrevSibling = function() {
  var path = this.smsWorkflow.path;
  return path && path[path.length - 1] > 0;
};
MessageState.prototype._hasPrevParentLoop = function() {
  var loop = this.smsWorkflow.loops[this.step.parent.loopKey];
  var path = this.smsWorkflow.path;
  return path && path[path.length - 1] === 0 && loop && loop.pos > 0;
};

MessageState.prototype._descendIntoChildren = function(path, last) {
  // Given a path, descend into any un-sentinelized children, modifying the path.
  var step = this._getStep(path);
  var pos;
  while (!step.prompt && step.steps) {
    pos = last ? step.steps.length - 1 : 0;
    path.push(pos);
    step = step.steps[pos];
  }
  return path;
};

MessageState.prototype._descendIntoPreviousLoops = function(path, loops) {
  this._descendIntoChildren(path, true);
  var step = this._getStep(path);
  var pos, loop;
  while (step.steps) {
    loop = loops[this._loopKey(path)];
    if (loop && loop.total > 0) {
      loop.pos = Math.max(0, loop.pos - 1);
      pos = step.steps.length - 1;
      path.push(pos);
      step = step.steps[pos];
    } else {
      return;
    }
  }
};

MessageState.prototype._getStep = function(path) {
  if (!path) {
    return null;
  }
  var step = SMSWorkflows[this.smsWorkflow.workflow];
  for (var i = 0; i < path.length; i++){
    step = step.steps[path[i]];
  }
  return step;
};

// Return the loop position and count that is a parent of the current step.
// This is used to resolve the value of ".$." in field names as well as the
// value of 'n' and 'nth' for prompts.
MessageState.prototype._getCurrentLoopForStep = function(step) {
  step = (step || this.step);
  while (step && !step.loopn && step.parent) {
    step = step.parent;
  }
  if (step && step.loopKey) {
    return this.smsWorkflow.loops[step.loopKey];
  }
  return null;
};

// Get the next step and loop.
MessageState.prototype.getNext = function() {
  var next = _.clone(this.smsWorkflow.path);
  if (this._isLoopSentinel()) {
    // If we've just asked a loop iteration question and have loops to do,
    // descend into the loop.
    next.push(0);
    next = this._descendIntoChildren(next);
    return {path: next, loops: this.smsWorkflow.loops};
  } else if (this._hasNextSibling()) {
    // If we have a sibling question, move over to it.
    next[next.length - 1] += 1;
    next = this._descendIntoChildren(next);
    return {path: next, loops: this.smsWorkflow.loops};
  } else if (this._hasNextParentLoop()) {
    // If we have no more siblings, but have more of the current loop to do,
    // loop back.  Increment the loop counter and go to the top of the current
    // branch.
    next[next.length - 1] = 0;
    var loops = _.clone(this.smsWorkflow.loops);
    loops[this.step.parent.loopKey].pos += 1;
    next = this._descendIntoChildren(next);
    return {path: next, loops: loops};
  } else if (this.step && this.step.parent) {
    // We're done with the current loops, branches, or sections -- get the
    // parent's next state given that loops are done.
    var newWorkflow = _.clone(this.smsWorkflow);
    newWorkflow.path = next.slice(0, next.length - 1);
    newWorkflow.loops = _.clone(newWorkflow.loops);
    if (newWorkflow.loops[this.step.parent.loopKey]) {
      newWorkflow.loops[this.step.parent.loopKey].pos = newWorkflow.loops[this.step.parent.loopKey].total;
    }
    var parentState = new MessageState(newWorkflow);
    // Recurse!
    return parentState.getNext();
  } else {
    // All done!
    return {path: null, loops: null};
  }
};

// Get the previous step and loop.
MessageState.prototype.getPrev = function() {
  var prev = _.clone(this.smsWorkflow.path);
  var loops = _.clone(this.smsWorkflow.loops);
  if (this._hasPrevParentLoop()) {
    // At the beginning of a loop, moving to the previous iteration.
    prev[prev.length - 1] = this.step.parent.steps.length - 1;
    loops[this.step.parent.loopKey].pos -= 1;
    return {path: prev, loops: loops};
  } else if (this._prevSiblingIsLoop()) {
    prev[prev.length - 1] -= 1;
    loops[this._loopKey(prev)].pos -= 1;
    this._descendIntoPreviousLoops(prev, loops);
    return {path: prev, loops: loops};
  } else if (this._hasPrevSibling()) {
    prev[prev.length - 1] -= 1;
    this._descendIntoChildren(prev, true);
    return {path: prev, loops: loops};
  
  } else {
    var step;
    while (true) {
      if (prev[prev.length - 1] === 0) {
        prev = prev.slice(0, prev.length - 1);
        step = this._getStep(prev);
        if (step.prompt) {
          break;
        }
      } else if (prev.length === 0) {
        return {path: [0, 0], loops: loops};
      } else {
        prev[prev.length - 1] -= 1;
        step = this._getStep(prev);
        if (step.prompt) {
          break;
        } else if (step.steps) {
          this._descendIntoPreviousLoops(prev, loops);
          break;
        }
      }
    }
    return {path: prev, loops: loops};
  }
};

MessageState.prototype.truncateObjArrayAtStep = function(total) {
  // Slice existing array if needed (e.g. we've gone back and reduced the
  // number of iterations for this loop).
  if (this.obj) {
    // Get the name of the array from the first child step of the loop.
    var field = this.step.steps[0].field.split(".$")[0];
    var dotparts = field.split(".");
    var subobj = this.obj;
    while (subobj && dotparts.length > 0) {
      subobj = subobj[dotparts.shift()];
    }
    var arr;
    if (!subobj) {
      return;
    } else if (!_.isArray(subobj)) {
      arr = [];
    } else {
      arr = subobj;
    }
    arr = arr.slice(0, total);
    var update = {};
    update[field] = arr;
    this.collection.update(this.obj._id, {$set: update});
  }
};

// Set the loop total for the current step.
MessageState.prototype.setLoopTotal = function(total) {
  this.smsWorkflow.loops = this.smsWorkflow.loops || {};
  this.smsWorkflow.loops[this.step.loopKey] = {total: total, pos: 0};
};

MessageState.prototype.clone = function() {
  // quick 'n' dirty deep copy
  var workflowClone = JSON.parse(JSON.stringify(this.smsWorkflow));
  return new MessageState(workflowClone);
};

// Increment to the next step.
MessageState.prototype.incrementPosition = function() {
  var next = this.getNext();
  this._setPath(next.path, next.loops);
  if (this.step) {
    // If this field already has a value stored, move on to the next step.
    if (this.isDataEntryStep()) {
      if (typeof this.getFieldValue(this.step) !== "undefined") {
        this.incrementPosition(); // recurse
      }
    } else if (this.isSentinelStep() || this.step.bare) {
      // Otherwise, look to see if there's a value inside the loop or branch.
      // Skip the sentinel if so.
      var stateClone = this.clone();
      stateClone.incrementToNextDataEntryStep();
      if (typeof stateClone.getFieldValue() !== "undefined") {
        this.incrementPosition(); // recurse
      }
    }
  }
};

MessageState.prototype.incrementToNextDataEntryStep = function() {
  var next;
  while (this.step && !this.isDataEntryStep()) {
    if (this.isSentinelStep() && !this._getCurrentLoopForStep(this.step)) {
      this.setLoopTotal(1);
    }
    next = this.getNext();
    this._setPath(next.path, next.loops);
  }
};
// Decrement to the previous step.
MessageState.prototype.decrementPosition = function() {
  var prev = this.getPrev();
  this._setPath(prev.path, prev.loops);
  if (_.contains(prev.path, 1) && this._getStep(prev.path).bare) {
    this.decrementPosition();
  }
};
MessageState.prototype._setPath = function(path, loops) {
  // Set immediate.
  this.smsWorkflow.path = path;
  this.smsWorkflow.loops = loops;
  this.initialize(this.smsWorkflow, {collection: this.collection, obj: this.obj});
};

MessageState.prototype._objectLookup = function(field, loop) {
  var dotparts = field.split('.');
  var part;
  var obj = this.obj;
  while (obj && dotparts.length > 0) {
    part = dotparts.shift();
    if (part === "$") {
      if (!loop) {
        // Got a positional argument while not in a loop -- field value must
        // be undefined.
        return undefined;
      }
      part = loop.pos
    }
    obj = obj[part]
  }
  return obj;
};

// Get the value for the field at the current step.
MessageState.prototype.getFieldValue = function(step) {
  var step = (step || this.step);
  if (!step) {
    return undefined;
  }
  var loop = this._getCurrentLoopForStep(step);
  if (step.field) {
    return this._objectLookup(step.field, loop);
  } else if (step.multipleBooleans) {
    var res = {};
    var val;
    for (var i = 0; i < step.multipleBooleans.length; i++) {
      val = this._objectLookup(step.multipleBooleans[i].field, loop);
      if (typeof val !== "undefined") {
        res[step.multipleBooleans[i].field] = val;
      }
    }
    return (_.size(res) === 0) ? undefined : res;
  }
};

// Clear the field value(s) at the current step.
MessageState.prototype.clearObjValueAtStep = function() {
  if (this.obj && this.isDataEntryStep()) {
    var field = this.step.field;
    var loop = this._getCurrentLoopForStep(this.step);
    var inLoop = loop && !isNaN(loop.pos);
    var update = {$unset: {}};
    if (this.step.multipleBooleans) {
      var fields = _.pluck(this.step.multipleBooleans, "field");
      _.each(fields, function(field, i) {
        if (inLoop) {
          field = field.replace("$", loop.pos);
        }
        update.$unset[field] = "";
      });
    } else if (inLoop) {
      update.$unset[field.replace("$", loop.pos)] = "";
    } else {
      update.$unset[field] = "";
    }
    this.collection.update(this.obj._id, update);
    // Update our local copy so we're in sync.
    this.obj = this.collection.findOne(this.obj._id);
  }
};

// Set the field for the current step to the given value.
MessageState.prototype.setObjValueAtStep = function(body) {
  var field = this.step.field;
  // Handle arrays
  var loop = this._getCurrentLoopForStep(this.step);
  if (field && loop && !isNaN(loop.pos)) {
    // Add array as needed. If we don't set an array first, the
    // positional operator we use below will fail. In the future, this
    // might be solved with findAndModify; but as this isn't supported,
    // we do a two-stage lookup / update.
    var arrayKey = field.split(".$")[0];
    var query = {_id: this.obj._id};
    query[field.split(".$")[0]] = {$exists: false};
    if (this.collection.findOne(query)) {
      var update = {};
      update[arrayKey] = [];
      this.collection.update(this.obj._id, {$set: update});
    }
    // Set the object array index.
    field = field.replace("$", loop.pos);
  }
  if (this.def && this.def.allowedValues) {
    return this._setAllowedValuesField(field, body);
  } else if (this.step.multipleBooleans) {
    return this._setMultipleBooleansField(body);
  } else if (this.def) {
    return this._setPlainField(field, body);
  } else {
    throw new Error("Unknown field");
  }
};
MessageState.prototype._setAllowedValuesField = function(field, body) {
  // Response should be a (1-based) integer index of the
  // allowedValues, or 0 for "none of the above".
  var def = this._getFieldDef(field);
  var index = parseInt(body);
  if (index === 0) {
    // none of the above
    var update = {$unset: {}};
    update.$unset[field] = "";
    this.collection.update(this.obj._id, update);
  } else if (!isNaN(index) && def.allowedValues[index - 1]) {
    var update = {};
    update[field] = def.allowedValues[index - 1];
    this.collection.update(this.obj._id, {$set: update});
  } else {
    // Error!
    return "Please send the number for one of the choices";
  }
};
MessageState.prototype._setMultipleBooleansField = function(body) {
  // Collect the numbers in the response, and switch them to 0-based indexing.
  var split = body.split(/[^\d]+/);
  var numbers = [];
  var n;
  for (var i = 0; i < split.length; i++) {
    n = parseInt(split[i]);
    if (!isNaN(n) && n >= 0 && n <= this.step.multipleBooleans.length) {
      numbers.push(n-1);
    }
  }
  if (numbers.length === 0) {
    return "Please list numbers for your choices";
  }

  // Prepare update.
  var update = {};
  var fields = _.pluck(this.step.multipleBooleans, "field");
  var noneOfAbove = _.contains(numbers, -1);
  var loop = this._getCurrentLoopForStep(this.step);
  var loopPos = loop && !isNaN(loop.pos) ? loop.pos : null;
  _.each(fields, function(field, i) {
    if (loopPos != null) {
      field = field.replace("$", loopPos);
    }
    update[field] = noneOfAbove ? false : _.contains(numbers, i);
  });
  this.collection.update(this.obj._id, {$set: update});
};
MessageState.prototype._setPlainField = function(field, body) {
  // Regular string response. Clean the value.
  var val;
  var def = this._getFieldDef(field);
  if (def.type === Boolean) {
    val = sms.yepnope(body);
    if (val == null) {
      return "Please reply with 'yes' or 'no'";
    }
  } else if (def.type === Number) {
    val = parseInt(body);
  } else if (def.type === Date) {
    var m = moment(new Date(body));
    if (!m.isValid()) {
      return "Please provide a date, e.g. 2015-06-01";
    }
    val = m.toDate();
  } else {
    val = body;
  }
  // Validation.
  var context = SMSWorkflows[this.smsWorkflow.workflow].schema.newContext();
  var update = {$set: {}};
  update["$set"][field] = val;
  var valid = context.validateOne(update, field, {modifier: true});
  if (valid) {
    this.collection.update(this.obj._id, update);
    return null;
  } else {
    return context.getErrorObject().message;
  }
};

MessageState.prototype.persist = function(user) {
  user.smsWorkflow = this.smsWorkflow;
  UserMethods.modifyUsers(user._id, {$set: {smsWorkflow: this.smsWorkflow}});
};

sms = {
  send: function(messageObject, callback) {
    twilioClient.messages.create({
      body: messageObject.body,
      to: "+1" + messageObject.to,
      from: TWILIO_NUMBER
    }, Meteor.bindEnvironment(function(err, msg) {
      if (err) {
        logger.error(err.reason, err);
      }
      SmsLogs.createForMsg(msg, false, err);
      if (callback) {
        callback(err);
      }
    }));
  },
  startWorkflow: function(workflowName, user, objectId) {
    // Run any setup code.
    SMSWorkflows[workflowName].initialize(user, objectId);
  },
  checkValidation: function(phone, body) {
    // Check to avoid SMS spoofing.  Returns:
    //  - a string containing an appropriate validation message
    //    if we need to do validation
    //  - true, if the given body validated this phone number.
    //  - null if no validation is needed.
    var m = SmsValidations.methods;
    var validation = m.getValidation(phone);
    if (validation) {
      if (m.isValidating(validation)) {
        if (body === null) {
          return m.prompt(validation);
        } else if (m.checkCode(validation, body)) {
          m.markValid(validation);
          return true;
        } else {
          m.incTries(validation);
          return m.reprompt(validation);
        }
      } else if (!m.isValid(validation)) {
        validation = m.newValidation(phone);
        return m.expiredPrompt(validation);
      } else {
        return null;
      }
    } else {
      validation = m.newValidation(phone);
      return m.prompt(validation);
    }
  },
  initiate: function(user, introMsg) {
    // Given a user that has a workflow initialized, start speaking to them.

    // Only proceed if we can text to them.
    if (!user || !user.profile.canText) {
      return;
    }
    var msg = (introMsg || "Hey, it's AdmitHub.") + " ";
    // Increment our position if we have a value set for our initial
    // position already.
    // Clone user's smsWorkflow so our speculative traversal doesn't modify
    // it before we're ready.
    var stateClone = new MessageState(JSON.parse(JSON.stringify(user.smsWorkflow)));
    stateClone.incrementToNextDataEntryStep();
    // If we have a field value, set our state to whatever state gets us
    // there.
    if (typeof stateClone.getFieldValue() !== "undefined") {
      stateClone.incrementPosition();
      stateClone.persist(user);
    } else if (!stateClone.step) {
      // If we have a null step, we're at the end. Persist that.
      stateClone.persist(user);
    }

    // Check validation state.
    var validationMessage = sms.checkValidation(user.profile.phone, null);
    if (validationMessage) {
      msg += validationMessage;
    } else {
      msg += sms.renderPrompt(user);
    }
    sms.send({body: msg, to: user.profile.phone});
    return msg;
  },
  handleSMS: function(phone, body) {
    body = body.trim();
    // Handle stop/start.
    // https://www.twilio.com/help/faq/sms/does-twilio-support-stop-block-and-cancel-aka-sms-filtering
    var user = Meteor.users.findOne({"profile.phone": phone});
    if (_.contains(["STOP", "STOPALL", "UNSUBSCRIBE",
                    "CANCEL", "END", "QUIT"], body)) {
      if (user) {
        UserMethods.modifyUsers(user._id, {$set: {"profile.canText": false}});
      }
      return null;
    } else if (_.contains(["START", "YES"], body)) {
      if (user) {
        UserMethods.modifyUsers(user._id, {$set: {"profile.canText": true}});
        user = Meteor.users.findOne(user._id);
        body = null;
      }
    }
    // If the user exists, but has ``canText`` set to false, return.
    if (user && user.profile && !user.profile.canText) {
      return null;
    }

    var msgParts = [];
    var validationMessage = sms.checkValidation(phone, body);
    if (validationMessage === true) {
      // We just revalidated.  Add the verified prompt to what we return, and
      // clear the validation body which we're now done with.
      body = null;
      msgParts.push(SmsValidations.methods.verifiedPrompt());
      var explanation = SmsValidations.methods.explainOnce(phone);
      if (explanation) {
        msgParts.push(explanation);
      }
    } else if (validationMessage) {
      return validationMessage;
    }
    // We know we're validated now.
    if (user) {
      if (user.smsWorkflow && user.smsWorkflow.path) {
        if (body != null) {
          // Regular message response.
          msgParts.push(sms.processResponse(user, body));
        } else {
          // We must've just re-verified.
          msgParts.push(sms.renderPrompt(user));
        }
      } else {
        // User exists, but has no workflow. Send something generic.
        // TODO: Logic to handle specifics of this user -- e.g. do they have
        // credits, etc.
        msgParts.push("To start an application, go to https://app.admithub.com.");
      }
    } else {
      // They've validated their number, but don't have a user account.
      // Create one and start the signup workflow.
      var user = {
        profile: {
          phone: SmsValidations.methods.cleanPhone(phone),
          canText: true
        },
        // This is a bit of a hack -- but we need to set up a place for us to
        // put a new email address in This could cause problems elsewhere if we
        // assume the "address" key will never be empty.
        emails: [{}]
      };
      user._id = Meteor.users.insert(user);
      sms.startWorkflow("signup", user, user._id);
      msgParts.push(sms.renderPrompt(user));
    }
    if (_.every(msgParts, _.isNull)) {
      return null;
    }
    return msgParts.join(" ").trim();
  },
  processResponse: function(user, body) {
    // The user's current workflow state
    var state = new MessageState(user.smsWorkflow);
    if (body.toLowerCase() === "#back") {
      // Skip back
      state.decrementPosition();
      state.clearObjValueAtStep();
      state.persist(user);
      return sms.renderPrompt(user);
    } else if (_.contains(["#skip", "#next"], body.toLowerCase())) {
      // Skip forward
      if (state.step.optional === false && typeof state.getFieldValue() === "undefined") {
        return sms.renderPrompt(user, false, true, "This field is required");
      } else {
        state.incrementPosition();
        state.persist(user);
        return sms.renderPrompt(user);
      }
    } else if (state.isDataEntryStep()) {
      // Normal response
      if (state.step.optional === false && body === "") {
        return sms.renderPrompt(user, false, true, "This field is required");
      }
      var errorMsg = state.setObjValueAtStep(body);
      if (errorMsg) {
        return sms.renderPrompt(user, false, true, errorMsg);
      } else {
        state.incrementPosition();
        state.persist(user);
        return sms.renderPrompt(user, true);
      }
    } else if (state.step.loopn) {
      // loop sentinel
      var n = parseInt(body);
      if (!isNaN(n) && n >= 0 && n <= 5) {
        n = Math.min(n, 5);
        state.setLoopTotal(n);
        state.truncateObjArrayAtStep(n); // Remove extra docs if we've reduced the number.
        state.incrementPosition();
        state.persist(user);
        return sms.renderPrompt(user);
      } else {
        return sms.renderPrompt(user, false, true, "Please reply with a number between 0 and 5");
      }
    } else if (state.step.branch) {
      // branch sentinel
      var yepnope = sms.yepnope(body);
      if (yepnope === true) {
        state.setLoopTotal(1);
        state.incrementPosition();
        state.persist(user);
        return sms.renderPrompt(user);
      } else if (yepnope === false) {
        state.setLoopTotal(0);
        state.incrementPosition();
        state.persist(user);
        return sms.renderPrompt(user);
      } else {
        return sms.renderPrompt(user, false, true, "Please reply with 'yes' or 'no'");
      }
    }
    // TODO: Error state?
    logger.error("Unknown field def", state.step);
    return null;
  },
  yepnope: function(txt) {
    if (_.contains(["yes", "y", "true"], txt.toLowerCase())) {
      return true;
    } else if (_.contains(["no", "n", "false"], txt.toLowerCase())) {
      return false;
    }
    return undefined;
  },
  renderPrompt: function(user, addExclamation, isRepeat, error) {
    var state = new MessageState(user.smsWorkflow);

    var exclamation;
    if (error) {
      error = error + ". ";
    } else if (addExclamation) {
      exclamation = getNextExclamation(user);
    }

    var msg;
    if (!state.step) {
      // All done.
      msg = SMSWorkflows[state.smsWorkflow.workflow].finish(user, state.obj);
      if (msg === null) {
        return null;
      }
    } else {
      var template;
      if (isRepeat && state.step.reprompt) {
        template = state.step.reprompt;
      } else {
        template = state.step.prompt;
      }
      var context = {};
      var loop = state._getCurrentLoopForStep(this.step);
      if (loop) {
        context.n = loop.pos;
        context.nth = nth(loop.pos);
      }
      context = _.extend(context, state.obj);
      msg = template(context);
      if (state.def && state.def.allowedValues) {
        msg += "\n" + _.map(state.def.allowedValues, function(v, i) {
          return "[" + (i + 1) + "] " + v
        }).join("\n")
      } else if (state.step.multipleBooleans) {
        msg += "\n" + _.map(state.step.multipleBooleans, function(v, i) {
          return "[" + (i + 1) + "] " + v.prompt(context)
        }).join("\n");
        msg += "\n[0] None of the above";
      }
    }

    if (state.step && state.step.bare) {
      state.incrementPosition();
      state.persist(user);
      msg += " " + sms.renderPrompt(user);
    }

    return (error || "") + (exclamation || "") + msg;
  },
  deleteMediaFile: function(url) {
    // https://www.twilio.com/docs/api/rest/media
    var match = /\/Messages\/([^\/]+)\/Media\/([^\/]+)/.exec(url);
    if (!match || !match[1] || !match[2]) {
      throw new Error("Bad media file url: " + url);
    }
    twilioClient.messages(match[1]).media(match[2]).delete(function(err, data) {
      if (err) {
        logger.error(err)
        throw new Error("Error deleting " + url + ": " + err.message);
      }
    });
  }
};

Router.route('/api/receiveSms', {
  name: 'receiveSms',
  where: 'server',
  action: function() {
    var params = this.request.body;
    logger.debug("Incoming SMS:", params);
    if (this.request.method == "POST") {
      var body = params.Body.trim();
      var phone = params.From.replace(/^\+1/, "");

      
      // Handle MMS.  If there's a file, clobber any body given with the
      // URL for the last one.  Delete videos and any additional images
      // in the request.
      var mediaError = "";
      var numMedia = parseInt(params.NumMedia);
      if (numMedia > 0) {
        // Delete all but last file.
        var keep = 0;
        if (numMedia > 1) {
          for (var i = 1; i < numMedia; i++) {
            sms.deleteMediaFile(params["MediaUrl" + i]);
            mediaError += "We're using only the first file you sent. ";
          }
        }
        // NOTE: this deletion logic is duped in smsLogs.
        if (!/^image\/.*$/.test(params["MediaContentType" + keep])) {
          sms.deleteMediaFile(params["MediaUrl" + keep]);
          mediaError += "Only images are supported. ";
          body = null;
        } else {
          body = params["MediaUrl" + keep];
        }
      }

      var smsLogId = SmsLogs.createForParams(params, true, null);

      // handle the sms
      logger.debug("input:", body);
      var responseBody = sms.handleSMS(phone, body);
      if (responseBody != null) {
        responseBody = mediaError + responseBody;
      }
      logger.debug("output:", responseBody);
      // Respond
      if (responseBody) {
        var twiml = new twilio.TwimlResponse();
        twiml.message(responseBody);
        SmsLogs.createForMsg({
          to: params.From,
          from: params.To,
          body: responseBody,
          inReplyTo: smsLogId
        }, false, null);
        this.response.writeHead(200, {"Content-Type": "text/xml"});
        this.response.end(twiml.toString());
      } else {
        this.response.writeHead(200, {"Content-Type": "text/plain"});
        this.response.end();
      }
    }  else {
      this.response.writeHead(400, {"Content-Type": "text/plain"});
      return this.response.end("POST required");
    }
  }
});

Router.route('/api/startFreeTrialBot', {
  name: 'startFreeTrialBot',
  where: 'server',
  action: function() {
    var params = this.request.body;
    try {
      var data = JSON.parse(params["data.json"]);
    } catch (e) {
      logger.debug(params);
      this.response.writeHead(400, {"Content-Type": "text/plain"});
      return this.response.end("data.json missing");
    }
    if (this.request.method != "POST") {
      logger.debug(params);
      this.response.writeHead(400, {"Content-Type": "text/plain"});
      return this.response.end("POST required");
    } else if (!data.phone_number) {
      logger.debug(params);
      this.response.writeHead(400, {"Content-Type": "text/plain"});
      return this.response.end("Missing phone number");
    }
    try {
      var phone = SmsValidations.methods.cleanPhone(data.phone_number[0]);
    } catch (e) {
      logger.debug(params);
      this.response.writeHead(400, {"Content-Type": "text/plain"});
      return this.response.end("Can't parse phone number");
    }
    if (!/^\d{10}$/.test(phone)) {
      logger.debug(params);
      this.response.writeHead(400, {"Content-Type": "text/plain"});
      return this.response.end("Invalid 10-digit US phone number: " + phone);
    }

    var user = Meteor.users.findOne({"profile.phone": phone});
    if (user) {
      if (!user.profile.canText) {
        this.response.writeHead(400, {"Content-Type": "text/plain"});
        return this.response.end("User not able to text.");
      }
      var app = CollegeApps.findOne({userId: user._id});
      if (app) {
        sms.send({to: phone, body: SMSWorkflows.freeTrialBot.existingAppMessage()});
        return this.response.end("OK");
      }
      var ftb = FreeTrialBots.findOne({userId: user._id});
      if (ftb) {
        if (!ftb.finished) {
          // Restart workflow for this ftb.
          if (!user.smsWorkflow || user.smsWorkflow.objectId !== ftb._id) {
            sms.startWorkflow("freeTrialBot", user, ftbid);
          }
          sms.initiate(user);
          return this.response.end("OK");
        } else {
          sms.send({to: phone, body: SMSWorkflows.freeTrialBot.existingAppMessage()});
          return this.response.end("OK");
        }
      }
    } else {
      var userId = Meteor.users.insert({profile: {phone: phone, canText: true}});
      user = Meteor.users.findOne(userId);
      UserMethods.updateUser(user);
    }

    var ftbid = FreeTrialBots.insert({userId: user._id, finished: false, modified: new Date()});
    sms.startWorkflow("freeTrialBot", user, ftbid);
    sms.initiate(user, SMSWorkflows.freeTrialBot.newFreeTrialBotMessage());
    return this.response.end("OK");
  }
});
