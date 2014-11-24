// ok...,
Meteor.startup(function () {
  Template[getTemplate('postShare')].helpers({
    sourceLink: function(){
      return !!this.url ? this.url : getSiteUrl() + "posts/"+this._id;
    },
    viaTwitter: function () {
      return !!getSetting('twitterAccount') ? 'via='+getSetting('twitterAccount') : '';
    }
  });
  Template[getTemplate('postShare')].events({
    'click .js-share-link': function(event){
      event.preventDefault();
      var $el = $(event.currentTarget);
      var $share = $el.next(".js-share-options");
      $(".js-share-link").not($el).removeClass("active");
      $(".js-share-options").not($share).addClass("hidden");
      $el.toggleClass("active");
      $share.toggleClass("hidden");
      var pos = $el.position();
      var linkWidth = $el.outerWidth(true);
      var linkHeight = $el.outerHeight(true);
      var shareHeight = $share.outerHeight(true);
      $share.css({
        left: (pos.left + linkWidth + 10) + "px",
        top: (pos.top - ((shareHeight - linkHeight) / 2)) + "px"
      });
    }
  });
});

