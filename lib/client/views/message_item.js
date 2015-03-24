var levels = {
  "error": "danger",
};
Template[getTemplate("ah_message_item")].helpers({
  getLevel: function(type) {
    return levels[type] || type;
  }
});
Template[getTemplate("ah_message_item")].events({
  'click .flash-messages .close': function(e) {
    $(e.currentTarget).closest(".alert").remove();
  }
});
