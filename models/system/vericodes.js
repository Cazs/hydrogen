var mongoose = require('mongoose');
const crypto = require('crypto');
var access_levels = require('./access_levels.js');

var vericodeSchema = mongoose.Schema(
  {
    usr:{
      type:String,
      required:true
    },
    code:{
      type:String,
      required:true
    },
    date_issued:{
      type: Number,
      required: true
    }
  }
);

var Vericodes = module.exports = mongoose.model('vericodes',vericodeSchema);
module.exports.ACCESS_MODE = access_levels.NORMAL;//Required access level to execute these methods

//Get Users
module.exports.getAll = function(callback)
{
  Vericodes.find({}, callback);
}

module.exports.add = function(username, callback)
{
  vericode = {'usr':username,'code':generateCode(16), 'date_issued': (new Date()/1000)};
  console.log(vericode.code);
  //Check if user being created is not greater than a normal user
  vericode.code = crypto.createHash('sha1').update(vericode.code).digest('hex');
  Vericodes.create(vericode, callback);
}

module.exports.update = function(id, user, callback)
{
  //Check if user being created is not greater than a normal user
  if(user.access_level)
  {
    if(user.access_level>access_levels.NORMAL)
    {
      console.log('User "%s[%s]", tried to upgrade his/her account to elevated privilleges.', user, id);
      return;
    }
  }
  var query = {_id: id};
  //var update = { usr: user.username};
  var sha = crypto.createHash('sha1');
  user.pwd = sha.update(user.pwd).digest('hex');
  Vericodes.findOneAndUpdate(query, user, {}, callback);
}

module.exports.remove = function(id, callback)
{
  var query = {_id: id};
  Vericodes.remove(query, callback);
}

module.exports.get = function(usr, callback)
{
  var query = {usr: usr};
  Vericodes.findOne(query, callback);
}

module.exports.validate = function(usr, code, callback)
{
  var hashed_code = crypto.createHash('sha1').update(code).digest('hex');
  var query = {usr: usr, code: hashed_code};
  var vericode = Vericodes.findOne(query, {});
  if(vericode)
  {
    //valid user and code
    var users = require('../users.js');
    var user = users.get(usr, function(error, user)
    {
        //look for user in db
        if(user)
        {
          //found user in db
          console.log('vericode validation> found user: %s', usr);
          user.active = true;//update active status
          users.update(user._id, user, callback);
        }else console.log('error: response=%s', error);
    });
  }
}

module.exports.isValid = function(user)
{
  if(isNullOrEmpty(user))
    return false;
  //attribute validation
  if(isNullOrEmpty(vericode.usr))
    return false;
  if(isNullOrEmpty(vericode.code))
    return false;

    return true;
}

generateCode = function(len)
{
  var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  var id = '';
  for(var i=0;i<len;i++)
  {
    var rand = Math.random() * (letters.length);
    id += letters.charAt(rand);
  }
  return id;
}

isNullOrEmpty = function(obj)
{
  if(obj==null)
  {
    return true;
  }
  if(obj.length<=0)
  {
    return true;
  }
  return false;
}
