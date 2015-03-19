themeSettings.useDropdowns = true; // not strictly needed since "true" is the current default

_.extend(templates, {
  layout: 'ah_layout',
  nav: 'ah_header', // nee 'nav'
  submitButton: 'ah_header_cta',
  error_item: "ah_error_item",
 
  userMenu: 'ah_nav_user',
  adminMenu: 'ah_nav_admin',
  topQuestions: 'ah_nav_top_questions',
  applicationRobot: 'ah_nav_application_robot',
 
  post_body: 'ah_post_body',
  posts_list: 'ah_posts_list',
  post_item: 'ah_post_item',
  post_edit: 'ah_post_edit',
  post_page: 'ah_post_page',
  post_submit: 'ah_post_submit',
  postAdmin: 'ah_post_admin',
  postDiscuss: 'ah_post_discuss',
  postInfo: 'ah_post_info',
  postUpvote: 'ah_post_upvote',
  postContent: 'ah_post_content',
  postAuthorName: 'ah_post_author_name',
  postCommentsLink: 'ah_post_comments_link',
  postCategories: 'ah_post_categories',
  postShare: 'ah_post_share',
  postTitle: 'ah_post_title',
  postsLoadMore: 'ah_posts_load_more',
  comment_form: 'ah_comment_form',
  comment_item: 'ah_comment_item',

  notificationsMenu: 'ah_nav_notifications_menu',
  notificationItem: 'ah_notification_item',
  notificationNewReply: 'ah_notification_new_reply',
  notificationNewComment: 'ah_notification_new_comment',

  newsletterBanner: 'ah_newsletter_banner',

  search: 'ah_search',
  user_email: 'ah_user_email'
});

ahAssetPath = '/packages/admithub_admithub-telescope-theme/public/'

primaryNav = [
  {template: 'notificationsMenu', order: 0},
  {template: 'applicationRobot', order: 1},
  {template: 'ah_search', order: 2}
];
secondaryNav = [
  {template: 'userMenu', order: 0}
];

// Override autoform labels for posts, and remove URL.
addToPostSchema.push({
  propertyName: "url",
  propertySchema: {type: String, optional: true, autoform: {omit: true}}
});
addToPostSchema.push({
  propertyName: "title",
  propertySchema: {
    type: String, optional: false, label: "Question", autoform: {editable: true}
  }
});
addToPostSchema.push({
  propertyName: "body",
  propertySchema: {
    type: String, optional: true, label: "Details", autoform: {editable: true, rows: 5}
  }
});

Meteor.startup(function() {
  // Replace "top" in nav if we have that as our default view.
  if (getSetting("defaultView") === "Top") {
    for (var i = 0; i < primaryNav.length; i++) {
      if (primaryNav[i] === "topQuestions") {
        primaryNav[i] = "newQuestions";
      }
    }
  }
  Avatar.options.defaultImageUrl = ahAssetPath + "img/owlAvatar.png";
  Avatar.options.defaultType = 'image';
  privacyOptions["roles"] = true;
});

contributorQueryTerms = {}
contributorQueryTerms["roles." + Roles.GLOBAL_GROUP] = {$in: ["Admin", "Officer", "Editor"]};

if (Meteor.isServer) {
  // One-off migration to ensure that all users have an email_hash set, even if
  // they came from AdmitHub.
  Meteor.startup(function() {
    Meteor.users.find(
      {"email_hash": null},
      {fields: {"_id": 1, "emails": 1}}
    ).forEach(function(user) {
      if (getEmail(user)) {
        Meteor.users.update(user._id, {$set: {"email_hash": Gravatar.hash(getEmail(user))}});
      }
    });
  });
}
