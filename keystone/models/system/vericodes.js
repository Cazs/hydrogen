var mongoose = require('mongoose');
const crypto = require('crypto');
var access_levels = require('./access_levels.js');
//mongoose.createConnection('mongodb://localhost/uj-hydrogen-innovation-society');

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
module.exports._NAME = 'Vericode';

/*module.exports = {
  add : function(username)
  {
    console.log('adding user %s', username);
  }
}*/
//Get Users
module.exports.getAll = function(callback)
{
  Vericodes.find({}, callback);
};

module.exports.add = function(username)
{
  /*mongoose.connection.on('connected', function()
  {
    console.log('connected to mongoDB');
  });

  mongoose.connection.on('error', function(error)
  {
    console.log(error);
  });*/
  console.log('attempting to create vericode');
  var vericode = {'usr':username,'code':generateCode(16), 'date_issued': (new Date()/1000)};
  console.log(vericode.code);
  //Check if user being created is not greater than a normal user
  vericode.code = crypto.createHash('sha1').update(vericode.code).digest('hex');
  mongoose.model('vericodes').create({name:'TEST',value:1},{});
  console.log('created vericode.');
};

module.exports.update = function(id, vericode, callback)
{
  var query = {_id: id};
  //var update = { usr: user.username};
  //var sha = crypto.createHash('sha1');
  //user.pwd = sha.update(user.pwd).digest('hex');
  Vericodes.findOneAndUpdate(query, vericode, {}, callback);
};

module.exports.remove = function(id, callback)
{
  var query = {_id: id};
  Vericodes.remove(query, callback);
};

module.exports.get = function(usr, callback)
{
  var query = {usr: usr};
  Vericodes.findOne(query, callback);
};

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
};

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
};

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
};

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
};
