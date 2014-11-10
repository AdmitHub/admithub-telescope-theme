var helpers = {};
// Duplicate definitions from telescope-notifications, which assigns helpers
// and events before our template override is defined.
_.each([
  "niceTime", "properties", "notificationHTML"
], function(key) {
  helpers[key] = Template.notificationItem.__helpers[" " + key];
});
Template.ah_notification_item.helpers(helpers);
Template.ah_notification_item.events({
  'click .action-link': function(event, instance){
    var notificationId=instance.data._id;
    Herald.collection.update({_id: notificationId},
                             {$set:{read: true}}, function(error, result){
        if(error){
          console.log(error);
        } 
      }
    );  
  }
});
