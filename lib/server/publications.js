Meteor.publish("freetrialbots", function() {
  if (this.userId) {
    return FreeTrialBots.find({userId: this.userId});
  }
  this.ready();
});
Meteor.publish("contributors", function() {
  return [
    Meteor.users.find(contributorQueryTerms, {fields: privacyOptions}),
    Comments.find({isDeleted: {$ne: true}}, {fields: {userId: 1}})
  ];
});
