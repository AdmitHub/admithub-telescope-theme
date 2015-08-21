var setPostedAt = function (updateObject) {
  var post = updateObject.$set
  if(post.status == 2 && !post.postedAt){
    updateObject.$set.postedAt = new Date();
  }
  return updateObject;
}
postEditMethodCallbacks.push(setPostedAt);