Template.ah_post_categories.helpers({
  ahCategories: function() {
    var categories = _.map(this.categories || [], function (categoryId) {
      return Categories.findOne(categoryId);
    });
    if (categories.length) {
      categories[categories.length - 1].last = true;
    }
    return categories;
  }
});

