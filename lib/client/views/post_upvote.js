Template[getTemplate('ah_post_upvote')].events({
  'click .js-unupvote': function(e, instance){
    var post = this;
    e.preventDefault();
    if(!Meteor.user()){
      Router.go(getSigninUrl());
      throwError(i18n.t("Please log in first"));
    }
    Meteor.call('cancelUpvotePost', post, function(error, result){
      trackEvent("post upvote cancelled", {'_id': post._id});
    });
  }
});


