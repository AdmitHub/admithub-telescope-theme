var t = _.template;
var promptOverrides = {
  "parent1CollegeName": t("What college did that parent attend, if any?"),
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
  "evaluation": t("Nearly done! Thanks. What did you think of this process?"),
  "evaluationRecommend": t("Enter their contact info here and we'll reach out to them.")
}
var questions = [];
function _walkSteps(obj) {
  _.each(obj.steps, function(step) {
    if (step.loopn) {
      // Only supports 1-level loops with flat answers (e.g. doesn't recurse
      // into sub-loops or sub-branches or handle multiple booleans within
      // loops).
      questions.push({
        prompt: promptOverrides[step.steps[0].field.split(".")[0]] || step.prompt,
        loopn: _.map(step.steps, function(step) {
          return {field: step.field, prompt: promptOverrides[step.field]() || step.prompt()}
        })
      });
    } else if (step.branch) {
      // only support 1-level branches, and append all resulting q's to the same page.
      // Rendering assumes "Yes" for branch.
      questions.push({
        prompt: step.prompt,
        branch: _.map(step.steps, function(step) {
          return {
            field: step.field,
            prompt: promptOverrides[step.field]({}) || step.prompt({})
          };
        })
      });
    } else if (step.steps) {
      _walkSteps(step);
    } else if (step.multipleBooleans) {
      var mb = step.multipleBooleans;
      questions.push({
        multipleBooleans: mb,
        prompt: promptOverrides[mb[0].field.split(".")[0]] || step.prompt
      });
    } else if (step.field) {
      questions.push({
        field: step.field,
        prompt: promptOverrides[step.field] || step.prompt
      });
    }
  })
};
_walkSteps(SMSWorkflows.freeTrialBot);

Template.freeTrialBot.helpers({
  currentQuestion: function(step) {
    //Session.set("ftbNext", step + 1);
    step = parseInt(step) || 1;
    var def = questions[step-1];
    var ftb = FreeTrialBots.findOne({userId: Meteor.userId()});
    var table;
    if (def.loopn) {
      // TODO: build table from current responses.
      table = [];
    }
    return {
      num: step,
      totalNum: questions.length,
      question: def.prompt(ftb),
      field: def.field || false,
      multipleBooleans: def.multipleBooleans || false,
      branch: def.branch || false,
      loopn: def.loopn || false,
      table: table,
      doc: ftb
    }
  },
  prevDisabled: function(step) {
    return step <= 1 ? "disabled" : "";
  },
  nextDisabled: function(step) {
    return step >= questions.length ? "disabled" : "";
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
  }
});

AutoForm.addHooks("freeTrialBot", {
  onSubmit: function(insertDoc, updateDoc, currentDoc) {
    Meteor.call("updateFreeTrialBot", updateDoc, function(err) {
      if (err) {
        flashMessage("Error saving form", "error");
      }
      Router.go("freeTrialBot", {step: Session.get("ftbNext")});
      Session.set("ftbNext", null);
    });
  },
  onError: function() {
    console.log(arguments);
  }
});
