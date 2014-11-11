/*
 *  These handlers are largely duplicated from packages/telescope-newsletter in
 *  order to decouple styles from event triggers.
 */
function dismissBanner() {
  $(".js-newsletter-banner").fadeOut("fast", function() {
    if (Meteor.user()) {
      setUserSetting('showBanner', false);
    } else {
      Cookie.set('showBanner', 'no');
    }
  });
};

function confirmSubscription() {
  dismissBanner();
  //
  //Flash.success("__default__", "Thank you, request received!", 2000);
};

Template[getTemplate('newsletterBanner')].events({
  "click .js-newsletter-dismiss": function(e) {
    e.preventDefault();
    dismissBanner();
  },
  "click .js-newsletter-button": function(e) {
    e.preventDefault();
    var $banner = $(".newsletter-banner-wrap");
    var handleAdded = function(err, result) {
      $banner.removeClass("show-loader");
      if (err) {
        console.log(err);
        Flash.danger(err.message);
      } else {
        console.log(result);
        confirmSubscription();
      }
    };

    if (Meteor.user()) {
      $banner.addClass("show-loader");
      Meteor.call("addCurrentUserToMailChimpList", handleAdded);
    } else {
      var email = $banner.find(".js-newsletter-email").val();
      if (!email) {
        alert("Pelase fill in your email.");
        return
      }
      $banner.addClass("show-loader");
      Meteor.call("addEmailToMailChimpList", email, handleAdded); 
    }

  }
});
