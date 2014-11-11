Template[getTemplate('ah_post_upvote')].helpers({
  voteCount: function() {
    return (this.upvotes || 0) - (this.downvotes || 0);
  }
});
Template[getTemplate('ah_post_upvote')].events({
  'click .js-unupvote': function(e, instance){
    var post = this;
    e.preventDefault();
    if(!Meteor.user()){
      Router.go(getSigninUrl());
      flashMessage(i18n.t("Please log in first"), "info");
    }
    Meteor.call('cancelUpvotePost', post, function(error, result){
      trackEvent("post upvote cancelled", {'_id': post._id});
    });
  }
});
