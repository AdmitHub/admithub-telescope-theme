// Override definition from telescope-lib/permissions.js
can.comment = function(user, returnError) {
  if (Roles.userIsInRole(user, ["Admin", "Editor", "Officer"])) {
    return true;
  }
  return returnError ? "no_rights" : false;
}

// Override methods from lib/users.js

isAdminById = function(userId) {
  return Roles.userIsInRole(userId, ["Admin"], Roles.GLOBAL_GROUP);
};

isAdmin = function(user) {
  user = user || Meteor.user();
  return !!user && isAdminById(user._id);
};
updateAdmin = function(userId, admin) {
  if (admin) {
    Roles.addUsersToRoles(userId, ["Admin"], Roles.GLOBAL_GROUP);
  } else {
    Roles.removeUsersFromRoles(userId, ["Admin"], Roles.GLOBAL_GROUP);
  }
}
adminMongoQuery = {$in: {}};
adminMongoQuery["$in"]["roles." + Roles.GLOBAL_GROUP] = "Admin";
notAdminMongoQuery = {$not: adminMongoQuery};
adminUsers = function() {
  return Meteor.users.find(adminMongoQuery);
};
getEmail = function(user) {
  if (user && user.emails && user.emails[0] && user.emails[0].address) {
    return user.emails[0].address;
  } else if (user && user.profile && user.profile.email) {
    return user.profile.email;
  }
  return null;
};
getUserSetting = function(setting, defaultValue, user) {
  // Override to avoid croaking if user.profile is undefined.
  var user = (typeof user == 'undefined') ? Meteor.user() : user;
  var defaultValue = (typeof defaultValue == "undefined") ? null: defaultValue;
  var settingValue = getProperty(user.profile || {}, setting);
  return (settingValue == null) ? defaultValue : settingValue;
};
