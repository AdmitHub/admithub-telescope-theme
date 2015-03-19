// Dynamic template name helpers
var templateNames = {};
_.each([
       "postTitle", "postDomain", "postInfo", "postAdmin", "postUpvote",
       "postDiscuss", "postActions", "postCommentsLink", "postCategories",
       "postAuthorName", "userTagsForPost", "ah_post_title_content",
       "ah_post_teaser", "postShare"
  ], function(templateName) {
    templateNames[templateName] = function() { return getTemplate(templateName); }
});

_.each(["ah_post_item", "ah_post_title_content"], function(template) {
  Template[getTemplate(template)].helpers(templateNames);
});

Template[getTemplate("ah_post_title_content")].helpers({
  getBodyTemplateName: function() {
    // Return the full body if we're on a post detail page, and a teaser
    // otherwise.
    if (_.contains(["post_page_with_slug", "post_page"], Router.current().route.getName())) {
      return "ah_post_body";
    }
    return "ah_post_teaser";
  }
});

Template[getTemplate("postAdmin")].events({
  'click .approve-link': function(e, instance){
    Meteor.call('approvePost', this);
    e.preventDefault();
  },
  'click .unapprove-link': function(e, instance){
    Meteor.call('unapprovePost', this);
    e.preventDefault();
  }
});

Template[getTemplate("ah_post_title_content")].helpers({
  can_edit: function() {
    return can.edit(Meteor.user(), this);
  }
});


