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

    // Redirect post pages to page with slug.
    Router.onBeforeAction(function() {
      if (this.ready()) {
        var post = Posts.findOne(this.params._id);
        console.log(post);
        if (post && post.title) {
          Router.go("post_page_with_slug",
                    {_id: this.params._id, slug: slugifyPost(post.title)},
                    {replaceState: true});
        }
        this.next();
      };
    }, {only: ["post_page"]});

    Router.route("/posts/:_id/p/:slug?", {
      name: "post_page_with_slug",
      controller: PostPageController
    });

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
            if (!tags || tags.length === 0) {
              Router.go("/survey/student/", null, {replaceState: true});
            } else {
              var student = UserTags.findOne({name: "Student"});
              if (_.contains(tags, student._id)) {
                Router.go("/survey/student/", null, {replaceState: true});
              } else {
                Router.go("/survey/parent-educator", null, {replaceState: true});
              }
            }
          }
        }
      }
    });
  });
}
