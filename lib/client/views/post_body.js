function targetBlankNoFollow(html) {
  var $html = $(html);
  $html.find("a").each(function(i, el) {
    el.target = '_blank';
    el.rel = 'nofollow';
  });
  return $html.prop('outerHTML');
}

Template[getTemplate("post_body")].helpers({
  targetBlankNoFollow: targetBlankNoFollow
});

Template[getTemplate("ah_post_teaser")].helpers({
  targetBlankNoFollow: targetBlankNoFollow,
  postBodyTeaser: function() {
    var html = "";
    if (this.htmlBody) {
      if (this.htmlBody.length < 400) {
        html = this.htmlBody;
      } else {
        html = $.trim($(this.htmlBody).text()).slice(0, 397) + "...";
      }
    }
    return html;
  }
});
