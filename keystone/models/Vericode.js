var keystone = require('keystone');
var crypto = require('crypto');
var mongoose = require('mongoose');

var Types = keystone.Field.Types;

/**
 * Vericode Model
 * ==========
 */
var Vericode = new keystone.List('Vericode');

Vericode.add({
	usr: { type: String, required: true, index: true, default:null },
	code: { type: String, required: true, default:null },
	date_issued: { type: Date, required: true, default:null }
});

Vericode.addNew = function(username, callback)
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
	var code = vericode.code;
  //sha1 hash the generated code
  vericode.code = crypto.createHash('sha1').update(vericode.code).digest('hex');

	var VericodeModel = mongoose.model('vericodes');
	VericodeModel.findOne({'usr':vericode.usr}, function(err, vc)
	{
		if(err)
		{
			console.log(err);
			return;
		}
		if(vc)
		{
			console.log('removing existing code for user: "%s"', vericode.usr);
			VericodeModel.findOneAndRemove({'usr':vericode.usr}, function(err)
			{
					if(err)
					{
						console.log(err);
						return;
					}
					console.log('successfully removed old vericode.');
			});
		}
		VericodeModel.create(vericode, function(err)
		{
				if(err)
				{
					console.log(err);
					callback(err);
					return;
				}else{
					//email code to user
					console.log('created new vericode: %s', code);
					callback();
				}
		});
	});

};

Vericode.update = function(id, vericode, callback)
{
  var query = {_id: id};
  //var update = { usr: user.username};
  //var sha = crypto.createHash('sha1');
  //user.pwd = sha.update(user.pwd).digest('hex');
  //Vericodes.findOneAndUpdate(query, vericode, {}, callback);
};

Vericode.remove = function(id, callback)
{
  var query = {_id: id};
  //Vericodes.remove(query, callback);
};

Vericode.get = function(usr, callback)
{
  var query = {usr: usr};
  //Vericodes.findOne(query, callback);
};

Vericode.validate = function(usr, code, callback)
{
  /*var hashed_code = crypto.createHash('sha1').update(code).digest('hex');
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
  }*/
};

Vericode.isValid = function(vericode)
{
  if(isNullOrEmpty(vericode))
    return false;
  //attribute validation
  if(isNullOrEmpty(vericode.usr))
    return false;
  if(isNullOrEmpty(vericode.code))
    return false;
	if(isNullOrEmpty(vericode.date_issued))
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

/**
 * Registration
 */
Vericode.defaultColumns = 'name, email, isAdmin';
Vericode.register();
