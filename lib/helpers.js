dottedLookup = function(string, obj) {
  var parts = string.split(".");
  while (obj && parts.length > 0) {
    obj = obj[parts.shift()];
  }
  return obj;
};

slugifyPost = function(title) {
  if (title) {
    return title.toLowerCase()
                .replace(/[^-a-z0-9]/g, '-')
                .substring(0, 140);
  }
  return '';
};

if (Meteor.isClient) {
  UI.registerHelper('ahAssetPath', function() {
    return ahAssetPath
  });
  UI.registerHelper('debug', function() {
    console.log(this);
  });

  UI.registerHelper("equals", function (a, b) {
    return (a == b);
  });

  UI.registerHelper('enumerate', function(arr) {
    return _.map(arr, function(val, i) {
      if (val != null) {
        val.index = i;
        return val;
      } else {
        return {index: i};
      }
    });
  });
}
