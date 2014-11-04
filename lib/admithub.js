themeSettings.useDropdowns = true; // not strictly needed since "true" is the current default

_.extend(templates, {
  layout: 'ah_layout',
  nav: 'ah_header', // nee 'nav'
  submitButton: 'ah_header_cta',
  error_item: "ah_error_item",
 
  userMenu: 'ah_nav_user',
  adminMenu: 'ah_nav_admin',
  topQuestions: 'ah_nav_top_questions',
  newQuestions: 'ah_nav_new_questions',
 
  posts_list: 'ah_posts_list',
  post_item: 'ah_post_item',
  post_page: 'ah_post_page',
  postAdmin: 'ah_post_admin',
  postDiscuss: 'ah_post_discuss',
  postInfo: 'ah_post_info',
  postUpvote: 'ah_post_upvote',
  postContent: 'ah_post_content',
  postAuthorName: 'ah_post_author_name',
  postCommentsLink: 'ah_post_comments_link',
  postCategories: 'ah_post_categories',
  postsLoadMore: 'ah_posts_load_more',

  notificationsMenu: 'ah_nav_notifications_menu',
  notificationItem: 'ah_notification_item',

  newsletterBanner: 'ah_newsletter_banner',

  search: 'ah_search'
});

primaryNav = ['ah_search', 'notificationsMenu', 'topQuestions', 'userMenu', 'adminMenu'];

secondaryNav = [];

ahAssetPath = '/packages/admithub_admithub-telescope-theme/public/'

if (Meteor.isClient) {
  Meteor.startup(function() {
    // Put touts templates on post list pages.
    function addTouts() {
      Router.setRegion("touts", "ah_touts")
    }
    Router.onAfterAction(addTouts, {
      only: ['posts_top', 'posts_default', 'posts_new', 'posts_best']
    });

    // Set titles on post list pages.
    function listTitle(title) {
      Session.set("postListTitle", title);
    }
    Router.onAfterAction(function() { listTitle("Top Questions"); }, {only: ['posts_top']});
    Router.onAfterAction(function() { listTitle("Newest Questions"); }, {only: ['posts_new']});
    Router.onAfterAction(function() { listTitle("Pending Questions"); }, {only: ['posts_pending']});
    Router.onAfterAction(function() { listTitle("Daily Digest"); }, {only: ['posts_digest']});
    Router.onAfterAction(function() {
      cat = Categories.findOne({"slug": this.params.slug});
      if (cat) {
        listTitle("Posts tagged “" + cat.name + "”");
      } else {
        listTitle("");
      }
    }, {only: ["posts_category"]});
    // Clear titles if we aren't using them.
    Router.onAfterAction(function() { listTitle(""); }, {except: [
      "posts_top", "posts_new", "posts_pending", "posts_digest", "posts_category"
    ]});

    // naxio:flash config
    Flash.switchProfile("bootstrap")
  });
}

UI.registerHelper('ahAssetPath', function() {
  return ahAssetPath
});
UI.registerHelper('debug', function() {
  console.log(this);
});

UI.registerHelper("equals", function (a, b) {
  return (a == b);
});

UI.registerHelper('enumerate', function(arr) {
  return _.map(arr, function(val, i) {
    if (val != null) {
      val.index = i;
      return val;
    } else {
      return {index: i};
    }
  });
});
