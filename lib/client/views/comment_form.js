Meteor.startup(function() {
  Template[getTemplate('comment_form')].rendered = function() {
    // API translating epic editor calls to dom.
    this.editor = {
      exportFile: function() {
        return $("#comment").val();
      },
      importFile: function(name, file) {
        $("#comment").val(file);
      }
    }
  }
});
