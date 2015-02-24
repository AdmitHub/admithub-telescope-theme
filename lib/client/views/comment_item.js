Template.ah_comment_item.helpers({
  targetBlank: function(html) {
    var $html = $(html);
    $html.find("a").each(function(i, el) {
      el.target = "_blank";
      console.log(el);
    });
    return $html.prop('outerHTML');
  }
});
