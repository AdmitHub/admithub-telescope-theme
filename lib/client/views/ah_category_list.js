Template.ah_category_list.helpers({
  categories: function() {
    var cats = []
    Categories.find({}, {"sort": {name: 1}}).forEach(function(cat) {
      cats.push({
        href: Router.path("posts_category", {slug: cat.slug}),
        name: cat.name
      })
    });
    return cats;
  }
});
