Template.ah_free_trial_bot_widget.helpers({
  questionCount: function() {
    return ftbQuestions.length;
  },
  progressStyle: function() {
    var ratio = getFtbAnswers().length / ftbQuestions.length;
    return "width: " + (ratio * 100) + "%;";
  }
});
