Template.contributors.helpers({
  contributors: function() {
    var contributors = [];
    Meteor.users.find(contributorQueryTerms).forEach(function(contributor) {
      contributor.commentCount = Comments.find({userId: contributor._id}).count();
      if (contributor.commentCount > 0) {
        contributors.push(contributor);
      }
    });
    contributors = _.sortBy(contributors, "commentCount");
    contributors.reverse();
    return contributors;
  },
  aboutAdmissionsPartners: function() {
    return aboutAdmissionsPartners;
  },
  getDisplayName: function() {
    return getDisplayName(this);
  }
});

