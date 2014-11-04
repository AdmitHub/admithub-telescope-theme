Template[getTemplate("ah_posts_list")].helpers({
  postListTitle: function() {
    return Session.get("postListTitle");
  }
});
