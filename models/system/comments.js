const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    usr:{
      type:String,
      required:true
    },
    comment:{
      type:String,
      required:true
    },
    date_logged:{
      type:Number,
      required:true
    },
    replyto:{
      type:String,
      required:true
    }
  });

  var Events = mongoose.model('events', eventSchema);

  //Required Access Level for Write permissions.
  module.exports.WRITE_LVL = access_levels.NORMAL;//only registered users can comment
  module.exports.READ_LVL = access_levels.ALL;
  module.exports._NAME = 'Comment';

  module.exports.add = function(comment, callback)
  {
    Events.create(comment, callback);
  }

  module.exports.get = function(comment_id, callback)
  {
    var query = {_id:comment_id};
    Events.find(query, callback);
  }

  module.exports.getAll = function(callback)
  {
    Events.find({}, callback);
  }

  module.exports.update = function(comment_id, comment, callback)
  {
    var query = {_id: comment_id};
    Events.findOneAndUpdate(query, comment, {}, callback);
  }

  module.exports.isValid = function(comment)
  {
    if(isNullOrEmpty(comment))
      return false;
    if(isNullOrEmpty(comment.usr))
      return false;
    if(isNullOrEmpty(comment.comment))
      return false;
    if(isNullOrEmpty(comment.date_logged))
      return false;
    if(isNullOrEmpty(comment.replyto))
      return false;

      return true;
  }

  function isNullOrEmpty(obj)
  {
    if(obj==null || obj==undefined)
      return true;
    if(obj.length<=0)
      return true;

    return false;
  }
