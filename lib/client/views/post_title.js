Template[getTemplate("postTitle")].helpers({
  postLinkWithSlug: function() {
    return Router.url("post_page_with_slug", {
      _id: this._id,
      slug: slugifyPost(this.title)
    });
  }
});
