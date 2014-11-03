Template[getTemplate('nav')].helpers({
  sectionIsClosed: function(section) {
    return !!Session.get("close-" + section);
  }
});
Template[getTemplate('nav')].events({
  'click .js-hamburger': function(event) {
    $('.js-header-nav').toggle();
    $('.js-hamburger').toggleClass('open');
  },
  'click .js-close-section': function(event) {
    var section = $(event.currentTarget).closest(".js-closable");
    section.hide();
    Session.set("close-" + section.attr("id"), true);
  }
});
