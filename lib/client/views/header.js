Template[getTemplate('nav')].events({
  'click .js-hamburger': function(event) {
    $('.js-header-nav').toggle();
    $('.js-hamburger').toggleClass('open');
  },
  'click .js-close-section': function(event) {
    $(event.currentTarget).closest(".js-closable").hide();
  }
});
