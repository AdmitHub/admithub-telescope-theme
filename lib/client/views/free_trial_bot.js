var t = _.template;
var promptOverrides = {
  "parent1CollegeName": t("What college did that parent attend, if any?"),
  "parent1Email": t("What is that parent's email?"),
  "parent2Name": t("If you have a second parent or guardian, what is their name?"),
  "parent2Email": t("What is that parent's email?"),
  "parent2Phone": t("What is that parent's phone number?"),
  "parent2CollegeName": t("What college did that parent attend, if any?"),
  "gpa": t("Could you tell us your GPA if you know it?"),
  "favoriteSubject": t("What's your favorite subject? (Select all that apply)"),
  "bestSubject": t("What's your best subject? (Select all that apply)"),
  "sat_tests": t("Everybody's favorite: the Standard Achievement Test (SAT)"),
  "act_tests": t("More standardized tests: ACT"),
  "other_tests": t("Other standardized tests (e.g. IB, SAT II)"),
  "sat_tests.$.test_date": t("Test date"),
  "sat_tests.$.math": t("Math"),
  "sat_tests.$.reading": t("Critical Reading"),
  "sat_tests.$.writing": t("Writing"),
  "sat_tests.$.essay": t("Essay"),
  "act_tests.$.test_date": t("Test date"),
  "act_tests.$.english": t("English"),
  "act_tests.$.math": t("Math"),
  "act_tests.$.reading": t("Reading"),
  "act_tests.$.science": t("Science"),
  "act_tests.$.essay": t("Essay"),
  "act_tests.$.composite": t("Composite"),
  "other_tests.$.name_of_test": t("Test name"),
  "other_tests.$.test_date": t("Test date"),
  "other_tests.$.score": t("Score"),
  "plannedCollege1": t("What's your first choice college you'd like to apply to?"),
  "plannedCollege2": t("What's your second choice college you'd like to apply to?"),
  "plannedCollege3": t("What's your third choice college you'd like to apply to?"),
  "evaluation": t("What did you think of this process?"),
  "evaluationRecommend": t("If you would like to recommend this to a friend, please enter their phone number here:"),
  "region": t("In what region of the country would you prefer to go to college? (Select all that apply)"),
}
ftbQuestions = [];
function _walkSteps(obj) {
  _.each(obj.steps, function(step) {
    if (step.loopn) {
      // Only supports 1-level loops with flat answers (e.g. doesn't recurse
      // into sub-loops or sub-branches or handle multiple booleans within
      // loops).
      var loopnField = step.steps[0].field.split(".")[0]
      ftbQuestions.push({
        prompt: promptOverrides[loopnField] || step.prompt,
        loopn: _.map(step.steps, function(step) {
          return {
            field: step.field,
            prompt: promptOverrides[step.field]() || step.prompt()
          }
        }),
        loopnField: loopnField
      });
    } else if (step.branch) {
      // only support 1-level branches, and append all resulting q's to the same page.
      // Rendering assumes "Yes" for branch.
      ftbQuestions.push({
        prompt: step.prompt,
        branch: _.map(step.steps, function(step) {
          var override = promptOverrides[step.field];
          return {
            field: step.field,
            prompt: (override && override({})) || step.prompt({})
          };
        })
      });
    } else if (step.steps) {
      _walkSteps(step);
    } else if (step.multipleBooleans) {
      var mb = step.multipleBooleans;
      ftbQuestions.push({
        multipleBooleans: mb,
        prompt: promptOverrides[mb[0].field.split(".")[0]] || step.prompt
      });
    } else if (step.field) {
      ftbQuestions.push({
        field: step.field,
        prompt: promptOverrides[step.field] || step.prompt
      });
    }
  })
};
_walkSteps(SMSWorkflows.freeTrialBot);

var _dotResolve = function(obj, field) {
  var parts = field.split(".");
  for (var i = 0; i < parts.length; i++) {
    obj = obj[parts[i]];
    if (typeof obj === "undefined") {
      return undefined;
    }
  }
  return obj;
};

getFtbAnswers = function() {
  var answers = [];
  if (!Meteor.user()) {
    return answers;
  }
  var ftb = FreeTrialBots.findOne({userId: Meteor.userId()});
  if (!ftb) {
    return answers;
  }
  _.each(ftbQuestions, function(def, i) {
    var answer;
    if (def.field) {
      answer = ftb[def.field];
    } else if (def.multipleBooleans) {
      var parts = [];
      _.each(def.multipleBooleans, function(mb) {
        var val = _dotResolve(ftb, mb.field);
        if (val) {
          parts.push(mb.prompt());
        }
      });
      answer = parts.length > 0 ? parts.join(", ") : undefined;
    } else if (def.branch) {
      var parts = [];
      _.each(def.branch, function(step) {
        var answer = _dotResolve(ftb, step.field);
        if (answer) {
          parts.push(answer);
        }
      });
      answer = parts.length > 0 ? parts.join("; ") : undefined;
    } else if (def.loopn) {
      var parts = [];
      _.each(ftb[def.loopnField], function(answerSet) {
        parts.push(_.map(def.loopn, function(substep) {
          var fieldParts = substep.field.split(".");
          var answer = answerSet[fieldParts[fieldParts.length - 1]];
          if (answer && answer.getDate) {
            return moment(answer).format("MMM DD, YYYY");
          }
          return answer;
        }).join("/"));
      });
      answer = parts.length > 0 ? parts.join("\n") : undefined;
    }
    var skipped = typeof answer === "undefined";
    answers.push({
      prompt: def.prompt(ftb),
      answer: skipped ? "[skipped]" : answer,
      skipped: skipped,
      step: i+1
    });
  });
  // Stop displaying answers at the last question they didn't skip.
  var stop = answers.length - 1;
  while (answers[stop].skipped && stop > 0) {
    stop -= 1;
  }
  answers = answers.slice(0, stop + 1);
  return answers;
}

Template.freeTrialBot.helpers({
  ah_afOptionsFromSchema: function() {
    // Duplicates afOptionsFromSchema does; the template context is borked otherwise.
    return AutoForm._getOptionsForField(this.name);
  },
  allAnswers: function() {
    return getFtbAnswers();
  },
  currentQuestion: function(step) {
    step = parseInt(step) || 1;
    if (step === ftbQuestions.length + 1) {
      return {done: true};
    }
    var def = ftbQuestions[step-1];
    var ftb = FreeTrialBots.findOne({userId: Meteor.userId()});
    var table;
    if (def.loopn) {
        
      // Build a table of responses
      table = [];
      _.each((ftb || {})[def.loopnField], function(response, i) {
        var row = {
          fields: [],
          index: i,
          schemaKey: def.loopnField
        };
        _.each(def.loopn, function(step) {
          var field = step.field.split(/\.[$\d]\./)[1];
          var val = {
            rawValue: response[field],
            field: def.loopnField + "." + i + "." + field
          };
          if (val.rawValue && val.rawValue.getDate) {
            val.value = moment(val.rawValue).format('MMM DD, YYYY');
          } else {
            val.value = val.rawValue;
          }
          row.fields.push(val);
        });
        table.push(row);
      });
 
      // Set insert index for all arrays to 0.
      _.each(def.loopn, function(obj) {
        obj.field = obj.field.replace(/\.[$\d]\./, "." + "0" + ".");
      });
    }

    // Remove all arrays so they don't futz with autoform.
    var docForAutoform = _.extend({}, ftb);
    _.each(docForAutoform, function(val, key) {
      if (_.isArray(val)) {
        delete docForAutoform[key];
      }
    });

    // Add ``name`` param required by AutoForm@5.0.0 afOptionsFromSchema
    if (def.multipleBooleans) {
      _.map(def.multipleBooleans, function(mb) { mb.name = mb.field; });
    }
    if (def.loopn) {
      _.map(def.loopn, function(ln) { ln.name = ln.field; });
    }
    if (def.branch) {
      _.map(def.branch, function(b) { b.name = b.field; });
    }

    return {
      done: false,
      num: step,
      totalNum: ftbQuestions.length,
      question: def.prompt(ftb),
      field: def.field || false,
      name: def.field, // required by AutoForm@5.0.0 afOptionsFromSchema 
      multipleBooleans: def.multipleBooleans || false,
      branch: def.branch || false,
      loopn: def.loopn || false,
      table: table,
      doc: docForAutoform
    }
  },
  prevDisabled: function(step) {
    return step <= 1 ? "disabled" : "";
  },
  nextDisabled: function(step) {
    return step > ftbQuestions.length ? "disabled" : "";
  },
  renderDatepickers: function() {
    setTimeout(function() {
      $("input[type='date']:not(.js-datepicker-added)").each(function(i, el) {
        var $el = $(el);
        $el.prop("type", "text");
        $el.addClass(".js-datepicker-added");
        var picker = new Pikaday({field: $el[0]});
      });
    }, 100);
  },
  showTrackerRegistrationComplete: function(key) {
    if (Session.get("registration-just-completed")) {
      Session.set("registration-just-completed", null);
      console.log("Show registration complete tracker", true);
      return true;
    }
    return false;
  },
  questionCount: function() {
    return ftbQuestions.length;
  }
});

Template.freeTrialBot.events({
  'click .js-nav-next': function(event) {
    var $el = $(event.currentTarget);
    if ($el.prop("disabled")) { return false; }
    Session.set("ftbNext", parseInt($el.attr("data-step")) + 1);
    $("#freeTrialBot").submit();
  },
  'click .js-nav-prev': function(event) {
    var $el = $(event.currentTarget);
    if ($el.prop("disabled")) { return false; }
    Session.set("ftbNext", parseInt($el.attr("data-step")) - 1);
    $("#freeTrialBot").submit();
  },
  'submit #freeTrialBot': function(event) {
    event.preventDefault();
  },
  'click .js-add-multiple': function(event) {
    event.preventDefault();
    Session.set("ftbNext", parseInt($(event.currentTarget).attr("data-step")));
    $("#freeTrialBot").submit();
  },
  'click .js-remove-multiple': function(event) {
    event.preventDefault();
    var ftb = FreeTrialBots.findOne({userId: Meteor.userId()});
    var schemaKey = $(event.currentTarget).attr("data-remove-schema-key");
    var removeIndex = parseInt($(event.currentTarget).attr("data-index"));
    var arr = ftb[schemaKey];
    arr.splice(removeIndex, 1);
    var update = {$set: {}};
    update.$set[schemaKey] = arr;
    Meteor.call("updateFreeTrialBot", update, function(err) {
      if (err) {
        flashMessage("Error saving form", "error");
      }
    });
  },
  'submit #js-sms-handoff': function(event) {
    event.preventDefault();
    var phone = $(".js-sms-handoff-phone").val();
    var step = $(event.currentTarget).attr("data-step");
    if (!/\d{10}/.test(SmsValidations.methods.cleanPhone(phone))) {
      return flashMessage("Please enter a 10-digit US phone number.", "error");
    }
    Meteor.call("freeTrialBotSmsHandoff", phone, step, function(err, failure) {
      if (err) {
        flashMessage("Error sending text.", "error");
      } else if (failure) {
        if (failure === "auth_required") {
          flashMessage("You must sign in first.", "error");
        } else if (failure === "phone_not_unique") {
          flashMessage("That phone number is in use by another user.", "error");
        }
      } else {
        flashMessage("Thanks! We'll follow up with a text message later.", "info");
      }
    });
  },
  'click .js-scroll-top': function(event) {
    window.scrollTo(0, 0);
  }
});

AutoForm.addHooks("freeTrialBot", {
  onSubmit: function(insertDoc, updateDoc, currentDoc) {
    // HACK Ugly hack to get around erroneous $unset's from autoform,
    // possibly from https://github.com/aldeed/meteor-autoform/issues/487.
    var realCurrentDoc = FreeTrialBots.findOne({userId: Meteor.userId()}) || {};
    _.each(updateDoc.$set || {}, function(val, key) {
      if (_.isArray(realCurrentDoc[key])) {
        updateDoc.$set[key] = updateDoc.$set[key].concat(realCurrentDoc[key]);
      }
    });
    _.each(updateDoc.$unset || {}, function(val, key) {
      if (_.isArray(realCurrentDoc[key])) {
        delete updateDoc.$unset[key];
      }
    });
    // Done with ftb?
    var next = Session.get("ftbNext");
    if (isNaN(next) || next === null) {
      next = parseInt($(".js-nav-next").attr("data-step")) + 1;
    }
    if (next - 1 >= ftbQuestions.length) {
      updateDoc.$set.finished = true;
    }

    Meteor.call("updateFreeTrialBot", updateDoc, function(err) {
      if (err) {
        flashMessage("Error saving form", "error");
      }
      Router.go("freeTrialBot", {step: next});
      window.scrollTo(0, 0);
      Session.set("ftbNext", null);
      // hack to clear form.
      AutoForm.resetForm("freeTrialBot");
      //AutoForm.invalidateFormContext("freeTrialBot");
      $(".js-add-multiple-row").find("input:not([type='hidden'])").val(null);
    });
  },
  onError: function(err) {
    console.log(err, arguments);
  }
});
