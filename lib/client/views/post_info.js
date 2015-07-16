Template.ah_post_info.helpers({
  postAuthorName: function(){
    return getTemplate("postAuthorName");
  },
  userTagsForPost: function() {
    return getTemplate("userTagsForPost");
  },
  canViewTimestamp: function() {
    return isAdmin() || isOfficer();
  },
  canViewUsername: function() {
    return isAdmin();
  }
});
