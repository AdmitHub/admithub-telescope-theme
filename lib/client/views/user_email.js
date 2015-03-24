Template[getTemplate('user_email')].events({
  'submit form': function(e) {
    var userTagIds = [];
    $("[name='usertag']:checked").each(function(i, el) {
      userTagIds.push($(el).val());
    });

    Meteor.users.update(Meteor.userId(), {$set: {
      "profile.tags": userTagIds
    }});
    var email = $("[name=email]").val();
    if (email) {
      Meteor.call("changeEmail", email, function(err) {
        if (err) {
          console.log(err);
          flashMessage("Error updating email addres", "error");
        }
      });
    }
  }
});
