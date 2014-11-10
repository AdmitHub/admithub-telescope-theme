Template[getTemplate("ah_header_cta")].helpers({
  showAskButton: function() {
    return !Meteor.user() || canPost(Meteor.user());
  }
});

Template[getTemplate('submitButton')].helpers({
  getTemplate: function () {
    return getTemplate(this);
  }
});

