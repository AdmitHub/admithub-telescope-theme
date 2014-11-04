Template[getTemplate('nav')].events({
  'click .js-hamburger': function(event) {
    $('.js-header-nav').toggle();
    $('.js-hamburger').toggleClass('open');
  },
  'click a': function(event) {
    $('.js-header-nav').hide();
    $('.js-hamburger').removeClass('open');
  }
});
