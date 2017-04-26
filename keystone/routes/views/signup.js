var keystone = require('keystone');
//var mongoose = require('mongoose');
var crypto = require('crypto');
var access_levels = require('../../models/system/access_levels.js');
var User = keystone.list('User');
var Vericode = keystone.list('Vericode');

exports = module.exports = function(req, res)
{
  var view = new keystone.View(req, res);
  var locals = res.locals;

	// Set locals
	locals.section = 'signup';
	//locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.formSubmitted = false;

  // On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'signup' }, function (next)
  {
    var newUser = new User.model();

    User.model.find()
              .exec()
              .then(function(users)
              {
                var found=false;
                users.forEach(function(user)
                {
                  var username = locals.formData.name;

                  if(user.name==username)
                    found=true;
                });

                if(!found)
                {
                  Vericode.addNew(locals.formData.name, function(err)
                  {
                    if(!err)
                    {
                      //to be executed if vericode was successfully created
                      console.log('creating new user');

                      var user = locals.formData;
                      user.access_level=access_levels.NORMAL;

                      User.addNew(user, function(err)
                      {
                        console.log(err||'successfully added new user: %s', user.name);
                      });
                    }else{
                      console.log('error: could not create new user because a verification code could not be created.');
                    }
                  });

                  //generate vericode
                  //var vericode = new Vericode();
                  //Vericode.add(user);
                  //console.log(Vericode.generateCode(16));
                  /*vericode.add(user.name, function(code, err)
                  {
                    console.log('created verification code');
                    //if vericode was created, create user
                    if(err)
                    {
                      console.log(err);
                      return;
                    }
                    console.log(code);
                    user.password = crypto.createHash('sha1').update(user.password).digest('hex');
                    user.active=false;
                    User.add(user, 'Permissions', {isAdmin: false});
                    //Send email with verification code
                  });*/
                }else{
                  console.log('user already exists.');
                }
              }, function(err)
              {
                console.log(err);
              });
	});

  view.render('signup');
};
