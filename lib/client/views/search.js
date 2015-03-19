// Replace the handler for the default search.
function quoteRegExp(str) {
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

function highlightTextNodes(node, pattern) {
  if (node.nodeType === 3) {
    // Is a text node. Highlight where found.
    var text = node.data;
    if (pattern.test(text)) {
      text = text.replace(pattern, "<span class='search-highlight'>$1</span>");
      $(node.parentNode).html(text);
    }
  } else if (node.nodeType === 1 && node.childNodes) {
    // Not a text node. Recurse.
    for (var i = 0; i < node.childNodes.length; i++) {
      highlightTextNodes(node.childNodes[i], pattern);
    }
  }
}
function normalizeTextNodes(node) {
  for (var i = 0, children = node.childNodes, nodeCount = children.length; i < nodeCount; i++) {
    var child = children[i];
    if (child.nodeType == 1) {
        normalizeTextNodes(child);
        continue;
    }
    if (child.nodeType != 3) { continue; }
    var next = child.nextSibling;
    if (next == null || next.nodeType != 3) { continue; }
    var combined_text = child.nodeValue + next.nodeValue;
    new_node = node.ownerDocument.createTextNode(combined_text);
    node.insertBefore(new_node, child);
    node.removeChild(child);
    node.removeChild(next);
    i--;
    nodeCount--;
  }
}

function unhighlight() {
  $(".search-highlight").each(function(i, el) {
    var parent = el.parentNode;
    parent.replaceChild(el.firstChild, el);
    normalizeTextNodes(parent);
  });
}

function highlight(val) {
  if (val) {
    setTimeout(function() {
      $(".post-content h4, .post-content .post-body").each(function(i, el) {
        highlightTextNodes(el, new RegExp("(" + quoteRegExp(val) + ")", "gi"));
      });
    }, 400);
  }
}

var doSearch = _.debounce(function(val, form) {
  form.removeClass("loading");
  unhighlight();

  if (val == '') {
    form.addClass('empty');
    Session.set("searchQuery", "");
    Router.go('/', null, {replaceState: true});
  } else {
    Session.set('searchQuery', val);
    form.removeClass("empty");
    var opts = {query: "q=" + encodeURIComponent(val)};
    var path = Router.current().route.path();
    if (path && path.indexOf('/search') === 0) {
      opts.replaceState = true;
    }
    Router.go('search', null, opts);

    // Highlight search terms
    highlight(val);
  }

}, 700);

Template[getTemplate('search')].events({
  'keyup .js-ah-search-field, search .js-ah-search-field': function(e) {
    e.preventDefault();
    var val = $(e.currentTarget).val(),
        form = $(e.currentTarget).closest("form.search");
    form.addClass("loading");
    doSearch(val, form);
  },
  'submit': function(e) {
    e.preventDefault();
  }
}); 
Template[getTemplate('search')].rendered = function() {
  highlight(Session.get("searchQuery"));
}

Meteor.startup(function() {
  Router.onAfterAction(function() {
    var path = Router.current().route.path();
    if (path && path.indexOf('/search') === -1) {
      unhighlight();
      $("#search").val("");
    }
  });
});
