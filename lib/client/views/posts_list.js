Template[getTemplate("ah_posts_list")].helpers({
  postListTitle: function() {
    console.log("session get ", Session.get("postListTitle"));
    return Session.get("postListTitle");
  }
});
