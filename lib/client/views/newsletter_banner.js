/*
 *  These handlers are largely duplicated from packages/telescope-newsletter in
 *  order to decouple styles from event triggers.
 */
function dismissBanner() {
};

Template[getTemplate('newsletterBanner')].events({
  "click .js-newsletter-button": function(e) {
    e.preventDefault();
    var $banner = $(".js-newsletter-banner-wrap");

    var email = $banner.find(".js-newsletter-email").val();
    if (!email) {
      alert("Pelase fill in your email.");
      return
    }
    $banner.addClass("show-loader");
    Meteor.call("addEmailToMailChimpList", email, function(err, result) {
      $banner.removeClass("show-loader");
      if (err) {
        console.log(err);
        flashMessage(err.message, "error");
      } else {
        dismissBanner();
        $banner.fadeOut("fast", function() {
          if (Meteor.user()) {
            setUserSetting('showBanner', false);
          } else {
            Cookie.set('showBanner', 'no');
          }
        });
        flashMessage("Thank you, request received!", "success");
      }
    });
  }
});
