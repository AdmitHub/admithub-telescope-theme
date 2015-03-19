var helpers = {};
// Duplicate definitions from telescope-notifications, which assigns helpers
// and events before our template override is defined.
_.each([
  "notificationItem", "notifications", "hasNotifications",
  "notification_count", "notification_class"
], function(key) {
  helpers[key] = Template.notificationsMenu.__helpers[" " + key];
});

helpers.countNotifications = function() {
  return Herald.collection.find({userId: Meteor.userId(), read: false}).count();
};

Template.ah_nav_notifications_menu.helpers(helpers);
Template.ah_nav_notifications_menu.events({
  'click .notifications-toggle': function(e){
    e.preventDefault();
    $('body').toggleClass('notifications-open');
  },
  'click .mark-as-read': function(){
    Meteor.call('heraldMarkAllAsRead', 
      function(error, result){
        error && console.log(error);
      }
    );
  }
});
