Meteor.startup(function() {
  Template[getTemplate('comment_edit')].rendered = function() {
    // Empty function to disable EpicEditor.
  }
});
