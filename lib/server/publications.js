Meteor.publish("freetrialbots", function() {
  if (this.userId) {
    return FreeTrialBots.find({userId: this.userId});
  }
  this.ready();
});
