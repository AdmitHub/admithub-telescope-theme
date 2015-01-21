Meteor.methods({
  createFreeTrialBotForUser: function() {
    var user = Meteor.user();
    if (!user) {
      throw new Error("Login required");
    }
    var ftb = FreeTrialBots.findOne({userId: Meteor.userId()});
    if (ftb) {
      return ftb;
    }
    var ftbId = FreeTrialBots.insert({
      userId: user._id,
      name: user.profile.name,
      email: user.profile.email
    });
    return FreeTrialBots.findOne(ftbId);
  },
  updateFreeTrialBot: function(updateDoc) {
    if (!Meteor.userId()) {
      throw new Error("Login required");
    }
    var ftb = FreeTrialBots.findOne({userId: Meteor.userId()});
    if (!ftb) {
      throw new Error("FTB not found");
    }
    delete updateDoc.$set.userId;
    var valid = FreeTrialBotSchema.newContext().validate(updateDoc, {modifier: true});
    if (valid) {
      FreeTrialBots.update({_id: ftb._id}, updateDoc);
    } else {
      throw new Error("Invalid update");
    }
  }
});
