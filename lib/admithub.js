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
  post_item: 'ah_post_item',
  postInfo: 'ah_post_info',
  postUpvote: 'ah_post_upvote',
  postContent: 'ah_post_content',
  postAuthorName: 'ah_post_author_name'
})

primaryNav = ['notificationsMenu', 'topQuestions', 'userMenu', 'adminMenu'];

secondaryNav = [];
