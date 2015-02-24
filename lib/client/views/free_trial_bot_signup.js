var EmailSchema = new SimpleSchema({
  email: { type: String, regEx: SimpleSchema.RegEx.Email, max: 140 }
});
var UsernameSchema = new SimpleSchema({username: { type: String, max: 140 }});
SimpleSchema.messages({
  userWithEmailExists: "A user with that email already exists. Would you like to <a href='/sign-in'>log in</a>?",
  usernameTaken: "Sorry, but that username is already taken."
});
var questions = [
  {
    field: "email",
    question: "What is your email address?",
    schema: EmailSchema,
    validate: function(value, cb) {
      Meteor.call('freeTrialBotSignupEmailCheck', value, function(err, valid) {
        if (!valid) {
          EmailSchema.namedContext("freeTrialBotSignup-email").addInvalidKeys([
            {name: "email", type: "userWithEmailExists"}
          ]);
        }
        cb(valid);
      });
    }
  },
  {
    field: "name",
    question: "What is your name?",
    schema: new SimpleSchema({ name: {type: String, max: 140} }),
    validate: function(val, cb) { cb(true); }
  },
  {
    field: "tag",
    schema: new SimpleSchema({
      tag: {type: String, allowedValues: ["Student", "Educator", "Parent"]}
    }),
    question: "Which best describes you?",
    validate: function(val, cb) { cb(true); }
  },
  {
    field: "username",
    schema: UsernameSchema,
    question: "If you post to the forum, what username should we use?",
    validate:  function(value, cb) {
      Meteor.call("freeTrialBotSignupUsernameCheck", value, function(err, valid) {
        if (!valid) {
          UsernameSchema.namedContext("freeTrialBotSignup-username").addInvalidKeys([
            {name: "username", type: "usernameTaken"}
          ]);
        }
        cb(valid);
      });
    }
  },
  {
    field: "password",
    schema: new SimpleSchema({password: {type: String, autoform: {type: 'password'}}}),
    question: "Please enter a password so we can log you back in.",
    validate: function(val, cb) { cb(!!val); }
  }
];

Template.free_trial_bot_signup.helpers({
  enforceQuestionOrder: function(step) {
    if (!step) { return {}; }
    // Enforce question order -- all fields required
    if (step > questions.length) {
      Router.go("free_trial_bot_signup", {step: questions.length});
      return
    }
    var val;
    for (var i = 0; i < step - 1; i++) {
      val = Session.get("ftbSignup-" + questions[i].field);
      if (!val && step !== i + 1) {
        Router.go("free_trial_bot_signup", {step: i + 1});
        return
      }
    }
  },
  currentQuestion: function(step) {
    var q = questions[step-1];
    if (!q) {
      return {};
    }
    var value = Session.get("ftbSignup-" + q.field);
    var def = q.schema.schema()[q.field];
    var type = "text";
    var ssContext = q.schema.namedContext("freeTrialBotSignup-" + q.field);
    if (def.allowedValues) {
      type = "select";
    } else if (def.autoform && def.autoform.type) {
      type = def.autoform.type;
    }
    var errorMsg = ssContext.keyErrorMessage(q.field);
    var currentQuestion = {
      field: q.field,
      question: q.question,
      errorMsg: errorMsg,
      type: type,
      def: def,
      value: value
    };
    return currentQuestion;
  },
  allAnswers: function() {
    var answers = [];
    _.each(questions, function(q, i) {
      var answer = Session.get("ftbSignup-" + q.field);
      if (answer) {
        answers.push({
          prompt: q.question,
          answer: q.field === "password" ? "********" : answer,
          skipped: false,
          step: i+1
        });
      }
    });
    return answers;
  },
  prevDisabled: function(step) {
    return step <= 1 ? "disabled" : "";
  },
  nextDisabled: function() {
    return "";
  },
  showTracker: function(step, desiredStep, key) {
    if (step === desiredStep) {
      var sesskey = "tracker-" + key + "-shown";
      if (!Session.get(sesskey)) {
        Session.set(sesskey, true);
        console.log("Show " + sesskey, true);
        return true;
      }
    }
    return false;
  }
});

Template.free_trial_bot_signup.events({
  'click .js-nav-prev': function(event) {
    var $el = $(event.currentTarget);
    if ($el.prop("disabled")) { return false; }
    Session.set("ftbSignupNext", parseInt($el.attr("data-step")) - 1);
    $("#freeTrialBotSignup").submit();
  },
  'click .js-nav-next': function(event) {
    var $el = $(event.currentTarget);
    if ($el.prop("disabled")) { return false; }
    Session.set("ftbSignupNext", parseInt($el.attr("data-step")) + 1);
    $("#freeTrialBotSignup").submit();
  },
  'submit #freeTrialBotSignup': function(event) {
    event.preventDefault();
    var doc = {};
    $("#freeTrialBotSignup [data-schema-key]").each(function(i, el) {
      doc[$(el).attr("data-schema-key")] = $(el).val() || undefined;
    });
    handleSubmit(doc);
  },
  'click .js-scroll-top': function(event) {
    window.scrollTo(0, 0);
  }
});

function handleSubmit(doc) {
  var key;
  var answer;
  for (key in doc) {
    answer = doc[key];
    break;
  }
  var question = _.find(questions, function(q) { return q.field === key; });
  if (!question) {
    return;
  }
  // Validate
  var ssContext = question.schema.namedContext("freeTrialBotSignup-" + key);
  var valid = ssContext.validate(doc);
  question.validate(answer, function(valid) {
    if (!valid) {
      return;
    }
    Session.set("ftbSignup-" + key, answer);

    var next = Session.get("ftbSignupNext");
    if (isNaN(next) || next == null) {
      next = parseInt($(".js-nav-next").attr("data-step")) + 1;
    }
    if (next - 1 >= questions.length) {
      finishSignup()
    } else {
      Router.go("free_trial_bot_signup", {step: next});
      Session.set("ftbSignupNext", null);
    }
  });
}


function finishSignup() {
  var doc = {};
  _.each(questions, function(q) {
    doc[q.field] = Session.get("ftbSignup-" + q.field);
  });
  doc.utm_medium = Session.get("utm_medium");
  console.log(doc);
  Meteor.call("freeTrialBotSignupFinish", doc, function(err, userid) {
    if (err || !userid) {
      flashMessage("Server error!", "error");
      console.log(err);
    } else {
      Session.set("registration-just-completed", true);
      Meteor.loginWithPassword(doc.email, doc.password, function() {
        Router.go("freeTrialBotBase");
        _.each(questions, function(q) {
          Session.set("ftbSignup-" + q.field, null);
        });
      });
    }
  });
}
