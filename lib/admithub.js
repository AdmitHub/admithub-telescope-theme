themeSettings.useDropdowns = true; // not strictly needed since "true" is the current default

_.extend(templates, {
  layout: 'ah_layout',
  nav: 'ah_header',
  submitButton: 'ah_header_cta',
 
  userMenu: 'ah_nav_user',
  adminMenu: 'ah_nav_admin',
  topQuestions: 'ah_nav_top_questions',
  newQuestions: 'ah_nav_new_questions',
 
  posts_list: 'ah_posts_list',
  postAdmin: 'ah_post_admin',
  postDiscuss: 'ah_post_discuss',
  post_item: 'ah_post_item',
  postInfo: 'ah_post_info',
  postUpvote: 'ah_post_upvote',
  postContent: 'ah_post_content',
  postAuthorName: 'ah_post_author_name',
  postCommentsLink: 'ah_post_comments_link',
  postsLoadMore: 'ah_posts_load_more',
 
  newsletterBanner: 'ah_newsletter_banner',

  search: 'ah_search'
});

primaryNav = ['ah_search', 'notificationsMenu', 'topQuestions', 'userMenu', 'adminMenu'];

secondaryNav = [];

ahAssetPath = '/packages/admithub_admithub-telescope-theme/public/'

UI.registerHelper('ahAssetPath', function() {
  return ahAssetPath
})
