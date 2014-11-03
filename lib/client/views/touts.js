Template[getTemplate('ah_touts')].helpers({
  sectionIsClosed: function(section) {
    return !!Session.get("close-" + section);
  }
});

Template[getTemplate("ah_touts")].events({
  'click .js-close-section': function(event) {
    var section = $(event.currentTarget).closest(".js-closable");
    section.hide();
    Session.set("close-" + section.attr("id"), true);
  }
});
