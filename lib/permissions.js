// Override definition from telescope-lib/permissions.js
can.comment = function(user, returnError) {
  if (Roles.userIsInRole(user, ["Admin", "Editor", "Officer"])) {
    return true;
  }
  return returnError ? "no_rights" : false;
}

// Override methods from lib/users.js

isRoleById = function(userId, role) {
  return Roles.userIsInRole(userId, role, Roles.GLOBAL_GROUP);
};

isAdminById = function(userId) {
  return isRoleById(userId, ["Admin"]);
};

isAdmin = function(user) {
  user = user || Meteor.user();
  return !!user && isAdminById(user._id);
};

isOfficer = function(user) {
  user = user || Meteor.user();
  return !!user && isRoleById(user._id, ["Officer"]);
};

updateAdmin = function(userId, admin) {
  if (admin) {
    Roles.addUsersToRoles(userId, ["Admin"], Roles.GLOBAL_GROUP);
  } else {
    Roles.removeUsersFromRoles(userId, ["Admin"], Roles.GLOBAL_GROUP);
  }
}
adminMongoQuery = {};
adminMongoQuery["roles." + Roles.GLOBAL_GROUP] = {
  "$eq": "Admin"
};
notAdminMongoQuery = {};
notAdminMongoQuery["roles." + Roles.GLOBAL_GROUP] = {
  "$ne": "Admin"
};
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
