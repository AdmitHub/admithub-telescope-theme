Template.survey_parent_educator.events({
  'click .js-newsletter-signup': function(event) {
    event.preventDefault();
    Meteor.call("addCurrentUserToMailChimpList", function(err, result) {
      if (err) {
        console.log(err);
        flashMessage(err.message, "error");
      } else {
        // Don't show the user banner anymore.
        setUserSetting("showBanner", false);
        Router.go("/");
        flashMessage("Thank you, request received!", "success");
      }
    });
  }
});
