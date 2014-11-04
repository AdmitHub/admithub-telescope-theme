// Dynamic template name helpers
var templateNames = {};
_.each([
       "postTitle", "postDomain", "postInfo", "postAdmin", "postUpvote",
       "postDiscuss", "postActions", "postCommentsLink", "postCategories",
       "postAuthorName", "userTagsForPost", "ah_post_title_content",
       "ah_post_teaser"
  ], function(templateName) {
    templateNames[templateName] = function() { return getTemplate(templateName); }
});

_.each(["ah_post_item", "ah_post_title_content"], function(template) {
  Template[getTemplate(template)].helpers(templateNames);
});

