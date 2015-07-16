Template.ah_post_info.helpers({
  postAuthorName: function(){
    return getTemplate("postAuthorName");
  },
  userTagsForPost: function() {
    return getTemplate("userTagsForPost");
  },
  showPostedLine: function() {
    var user = Meteor.user();
    var poster = Meteor.users.findOne(this.userId);
    return (this.categories && this.categories.length) ||
           can.seeTimestamps(user) ||
           can.seeUsernames(user) ||
           (poster && poster.profile && poster.profile.tags && poster.profile.tags.length);
  },
  usernameOrTags: function() {
    var user = Meteor.user();
    var poster = Meteor.users.findOne(this.userId);
    return can.seeUsernames(user) ||
           (poster && poster.profile && poster.profile.tags && poster.profile.tags.length);
  },
  canSeeUsernames: function() {
    return can.seeUsernames(Meteor.user());
  },
  canSeeTimestamps: function() {
    return can.seeTimestamps(Meteor.user());
  }
});

Template.ah_post_author_name.helpers({
  hasTags: function() {
    var poster = Meteor.users.findOne(this.userId);
    return poster && poster.profile && poster.profile.tags && poster.profile.tags.length;
  }
})