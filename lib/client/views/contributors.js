Template.contributors.events({
  "click .js-untruncate": function(e) {
    e.stopPropagation();
    e.preventDefault();

    var desc = $(e.target).data('desc')

    $(e.target).parent().html(desc);
  }
});

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
  },
  ahAssetPath: ahAssetPath,
  shortDescription: function(length) {
    var desc = this.description;

    if (desc.length > length) {
      var shortDesc = $.trim(desc).substring(0, length)
      .split(" ").slice(0, -1).join(" ") + "... <span data-desc='" + desc + "' class='type-link js-untruncate'>Read More</span>";
      console.log(desc);
    }

    return shortDesc;
  },
});


