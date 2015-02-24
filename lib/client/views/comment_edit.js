Meteor.startup(function() {
  Template[getTemplate('comment_edit')].rendered = function() {
    this.editor = {
      exportFile: function() {
        return $("#body").val();
      },
      importFile: function(name, file) {
        $("#body").val(file);
      }
    }
  }
});
