Meteor.startup(function() {
  Template[getTemplate('comment_form')].rendered = function() {
    // Empty function to disable EpicEditor.
  }
});
