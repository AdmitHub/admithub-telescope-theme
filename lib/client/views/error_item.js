Template[getTemplate("ah_error_item")].events({
  'click .flash-messages .close': function(e) {
    $(e.currentTarget).closest(".alert").remove();
  }
});
