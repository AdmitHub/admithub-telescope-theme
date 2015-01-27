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
    // don't allow changing userId.
    delete updateDoc.$set.userId;
    updateDoc.$unset && delete updateDoc.$unset.userId;

    var valid = FreeTrialBotSchema.newContext().validate(updateDoc, {modifier: true});
    if (valid) {
      FreeTrialBots.update({_id: ftb._id}, updateDoc);
    } else {
      throw new Error("Invalid update");
    }
  },
  freeTrialBotSmsHandoff: function(phone, step) {
    var user = Meteor.user();
    if (!user) {
      return "auth_required";
    }
    phone = SmsValidations.methods.cleanPhone(phone);
    if (user.profile.phone !== phone) {
      if (Meteor.users.findOne({"profile.phone": phone})) {
        return "phone_not_unique";
      }
    }
    Meteor.users.update(user._id, {
      $set: {"profile.phone": phone, "profile.canText": true}
    });
    var ftb = FreeTrialBots.findOne({userId: user._id});
    if (!ftb) {
      throw new Error("Can't find ftb for user.");
    }
    SMSWorkflows.freeTrialBot.initialize(user, ftb._id, [step]);
    return false;
  }
});
