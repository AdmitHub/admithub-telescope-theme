Template.facebookTracker.helpers({
  once: function(id) {
    var trackerSessKey = "tracker-facebook-" + id;
    if (Session.get(trackerSessKey)) {
      return false;
    }
    console.log(trackerSessKey, true);
    Session.set(trackerSessKey, true);
    return true;
  }
});
