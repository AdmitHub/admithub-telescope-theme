var questions = [
  {
    field: "email",
    question: "What is your email address?",
    schema: {type: String, regEx: SimpleSchema.RegEx.Email, max: 140},
  },
  {
    field: "name",
    question: "What is your name?",
    schema: {type: String, max: 140},
  },
  {
    field: "tag",
    question: "Which best describes you?",
    schema: {type: String, allowedValues: ["Student", "Educator", "Parent"]},
  },
  {
    field: "username",
    question: "If you post to the forum, what username should we use?",
    schema: {type: String, max: 140},
  },
  {
    field: "password",
    question: "Please enter a password so we can log you back in.",
    schema: {type: String, autoform: {type: "password"}},
  },

];

Template.free_trial_bot_signup.helpers({
  doc: function() {
    var doc = {};
    _.each(questions, function(q) {
      doc[q.field] = Session.get("ftbSignup-" + q.field);
    });
    return doc;
  },
  currentQuestion: function(step) {
    if (!step) { return {}; }
    if (step > questions.length) {
      // TODO something...
    }
    var q = questions[step-1];
    var value = Session.get("ftbSignup-" + q.field);
    var schemaFields = {};
    schemaFields[q.field] = q.schema;
    var currentQuestion = {
      field: q.field,
      question: q.question,
      schema: new SimpleSchema(schemaFields),
      value: value
    };
    console.log(currentQuestion);
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
    return step === 0 ? "disabled" : "";
  },
  nextDisabled: function() {
    return "";
  }
});

Template.free_trial_bot_signup.events({
  'click .js-nav-next': function(event) {
    var $el = $(event.currentTarget);
    if ($el.prop("disabled")) { return false; }
    Session.set("ftbSignupNext", parseInt($el.attr("data-step")) + 1);
    $("#freeTrialBotSignup").submit();
  },
  'submit #freeTrialBotSignup': function(event) {
    console.log("wat");
    event.preventDefault();
  },
  'click .js-scroll-top': function(event) {
    window.scrollTo(0, 0);
  }
});

AutoForm.addHooks("freeTrialBotSignup", {
  onSubmit: function(insertDoc, updateDoc, currentDoc) {
    console.log("onSubmit", insertDoc, currentDoc);
    _.each(updateDoc.$set, function(val, key) {
      Session.set("ftbSignup-" + key, val);
    });

    var next = Session.get("ftbSignupNext");
    if (isNaN(next) || next == null) {
      next = parseInt($(".js-nav-next").attr("data-step")) + 1;
    }
    if (next - 1 >= questions.length) {
      // TODO: FINISH
    }

    AutoForm.resetForm("freeTrialBotSignup");
    AutoForm.invalidateFormContext("freeTrialBotSignup");

    Router.go("free_trial_bot_signup", {step: next});
    Session.set("freeTrialBotNext", null);
    window.scrollTo(0, 0);
  },
  onError: function() {
    console.log(arguments);
  }
});
