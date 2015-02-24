Template.ah_comment_item.helpers({
  targetBlank: function(html) {
    var $html = $(html);
    $html.find("a").each(function(i, el) {
      el.target = "_blank";
    });
    return $html.prop('outerHTML');
  }
});
