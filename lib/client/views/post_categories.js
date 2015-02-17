Template.ah_post_categories.helpers({
  ahCategories: function() {
    var categories = [];
    _.each(this.categories || [], function (categoryId) {
      var category = Categories.findOne(categoryId);
      if (category) {
        categories.push(category);
      }
    });
    if (categories.length > 0) {
      categories[categories.length - 1].last = true;
    }
    return categories;
  }
});

