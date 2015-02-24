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
  postsLoadMore: 'ah_posts_load_more',
  comment_form: 'ah_comment_form',
  comment_item: 'ah_comment_item',

  notificationsMenu: 'ah_nav_notifications_menu',
  notificationItem: 'ah_notification_item',
  notificationNewReply: 'ah_notification_new_reply',
  notificationNewComment: 'ah_notification_new_comment',

  newsletterBanner: 'ah_newsletter_banner',

  search: 'ah_search'
});

ahAssetPath = '/packages/admithub_admithub-telescope-theme/public/'

primaryNav = ['notificationsMenu', 'applicationRobot', 'ah_search'];
secondaryNav = ['userMenu'];

dottedLookup = function(string, obj) {
  var parts = string.split(".");
  while (obj && parts.length > 0) {
    obj = obj[parts.shift()];
  }
  return obj;
}

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
  Meteor.publish("contributors", function() {
    return [
      Meteor.users.find(contributorQueryTerms, {fields: privacyOptions}),
      Comments.find({isDeleted: {$ne: true}}, {fields: {userId: 1}})
    ];
  });
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

if (Meteor.isClient) {
  Meteor.startup(function() {
    // load freetrialbots for use on landing page.
    preloadSubscriptions.push("freetrialbots");

    // Put touts templates on post list pages.
    Router.onAfterAction(function() {
      this.render("ah_touts", {to: "touts"});
    }, {
      only: ['posts_top', 'posts_default', 'posts_new', 'posts_best', 'post_page']
    });

    // Set titles on post list pages.
    function listTitle(title) {
      Session.set("postListTitle", title);
    }
    var defaultView = getSetting("defaultView");
    var topTitles = ["posts_top"];
    var newTitles = ["posts_new"];
    if (defaultView === "Top") {
      topTitles.push("posts_default");
    } else if (defaultView === "New") {
      newTitles.push("posts_default");
    }
    Router.onAfterAction(function() { listTitle("Top Questions"); },
                         {only: topTitles});
    Router.onAfterAction(function() { listTitle("Newest Questions"); },
                         {only: newTitles});
    Router.onAfterAction(function() { listTitle("Pending Questions"); },
                         {only: ['posts_pending']});
    Router.onAfterAction(function() { listTitle("Daily Digest"); },
                         {only: ['posts_digest']});
    Router.onAfterAction(function() {
      cat = Categories.findOne({"slug": this.params.slug});
      listTitle(cat ? "Posts tagged “" + cat.name + "”" : "");
    }, {only: ["posts_category"]});
    // Clear titles if we aren't using them.
    Router.onAfterAction(function() { listTitle(""); }, {except: [
      "posts_default", "posts_top", "posts_new", "posts_pending",
      "posts_digest", "posts_category"
    ]});

    // Fix scroll position on category page links (issue #12)
    Router.onAfterAction(function() { window.scrollTo(0, 0); }, {only: ["posts_category"]});

    Router.route("/contributors", {
      name: "contributors_redirect",
      action: function() {
        Router.go("/partners-and-contributors", null, {"replaceState": true});
      }
    });
    Router.route("/partners-and-contributors", {
      name: "contributors",
      waitOn: function() { return Meteor.subscribe("contributors"); }
    });

    var waitOnLogin = function() {
      return {ready: function() { return !Meteor.loggingIn(); }};
    };

    Router.route("/survey/signup/:step?", {
      name: "free_trial_bot_signup",
      waitOn: waitOnLogin,
      data: function() {
        if (this.ready()) {
          var step = parseInt(this.params.step);
          if (Meteor.user()) {
            Router.go("/survey/", null, {replaceState: true});
          } else if (!step || isNaN(step)) {
            // TODO: Advance to "next" step instead of first.
            Router.go("/survey/signup/1", null, {replaceState: true});
          } else {
            return {step: step};
          }
        }
      }
    });

    Router.route("/survey/parent-educator", {
      name: "parentEducatorSurvey",
      template: "survey_parent_educator",
      onBeforeAction: filters.isLoggedIn,
      waitOn: waitOnLogin,
    });

    Router.route("/survey/student/:step?", {
      name: "freeTrialBot",
      waitOn: function() {
        return [waitOnLogin(), Meteor.subscribe("freetrialbots")]
      },
      onBeforeAction: filters.isLoggedIn,
      data: function() {
        if (this.ready()) {
          var ftb = FreeTrialBots.findOne({userId: Meteor.userId()});
          if (!ftb) {
            Meteor.call("createFreeTrialBotForUser", function(err, ftb) {
              console.log(err);
            });
          } else if (!this.params.step || isNaN(parseInt(this.params.step))) {
            // Find the next un-answered question
            for (var i = 0; i < ftbQuestions.length; i++) {
              var val;
              if (ftbQuestions[i].field) {
                val = dottedLookup(ftbQuestions[i].field, ftb); 
              } else if (ftbQuestions[i].multipleBooleans) {
                // Find any non-undefined value in the multiple boolean.
                val = _.find(_.map(ftbQuestions[i].multipleBooleans, function(f) {
                  return dottedLookup(f.field, ftb);
                }), function(v) { return typeof v !== "undefined"; });
              }
              if (typeof val === "undefined") {
                break;
              }
            }
            Router.go("/survey/student/" + (i + 1), null, {replaceState: true});
          } else {
            return { step: parseInt(this.params.step) }
          }
        }
      }
    });

    Router.route("/survey", {
      name: "freeTrialBotBase",
      waitOn: waitOnLogin,
      action: function() {
        if (this.params.query.utm_medium) {
          Session.set("utm_medium", this.params.query.utm_medium);
        }
        if (this.ready()) {
          if (!Meteor.user()) {
            Router.go("/survey/signup/", null, {replaceState: true});
          } else {
            var tags = Meteor.user().profile.tags;
            if (!tags || tags.length === 0 || _.contains(tags, "Student")) {
              Router.go("/survey/student/", null, {replaceState: true});
            } else {
              Router.go("/survey/parent-educator", null, {replaceState: true});
            }
          }
        }
      }
    });

  });

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
}
