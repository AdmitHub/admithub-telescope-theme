Template.ah_free_trial_bot_widget.helpers({
  verb: function() {
    console.log(getFtbAnswers().length);
    return getFtbAnswers().length === 0 ? "Get Started" : "Continue";
  },
  questionCount: function() {
    return ftbQuestions.length;
  },
  progressStyle: function() {
    var ratio = getFtbAnswers().length / ftbQuestions.length;
    return "width: " + (ratio * 100) + "%;";
  }
});
