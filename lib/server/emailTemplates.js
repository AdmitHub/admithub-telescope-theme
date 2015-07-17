Meteor.startup(function() {
  Accounts.emailTemplates.enrollAccount.subject = function (user) {
    return "Welcome to AdmitHub!";
  };
  Accounts.emailTemplates.enrollAccount.text = function (user, url) {
    return "Welcome to AdmitHub!\n\n" +
      "To activate your account, simply click the link below:\n\n" +
      url;
  };
});