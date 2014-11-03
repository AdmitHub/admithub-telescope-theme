var templateNames = {};
_.each(["postTitle", "postDomain", "postInfo", "postAdmin",
  "postUpvote", "postDiscuss", "postActions", "postCommentsLink",
  "postCategories", "postAuthorName", "userTagsForPost"], function(templateName) {
  templateNames[templateName] = function() { return getTemplate(templateName); }
});

Template.ah_post_item.helpers(templateNames);
