function toutCloseKey(key) {
  return "close-" + key;
}

Template[getTemplate('ah_touts')].helpers({
  sectionIsClosed: function(section) {
    var key = toutCloseKey(section);
    return Cookie.get(key) == "yes" || (Meteor.user() && !!getUserSetting(key, false));
  },
  showTouts: function() {
    // Show only if the newsletter banner isn't shown.
    return true;
  },
  randomPartner: function() {
    return aboutAdmissionsPartners[parseInt(Math.random() * aboutAdmissionsPartners.length)];
  }
});

Template[getTemplate("ah_touts")].events({
  'click .js-close-section': function(event) {
    event.preventDefault()
    event.stopPropagation()
    var section = $(event.currentTarget).closest(".js-closable");
    section.hide();
    var key = toutCloseKey(section.attr("id"));
    Cookie.set(key, "yes")
    Meteor.user() && setUserSetting(key, true);
  }
});
