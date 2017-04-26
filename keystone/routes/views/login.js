var keystone = require('keystone');
const crypto = require('crypto');
var access_levels = require('../../models/system/access_levels.js');
var User = keystone.list('User');

exports = module.exports = function(req, res)
{
  var view = new keystone.View(req, res);
  var locals = res.locals;

	// Set locals
	locals.section = 'login';
	//locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.loginSubmitted = false;
  locals.loggedOn = false;

  // On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'login' }, function (next)
  {
    //Check if user being created is not greater than a normal user
    /*if(user.access_level)
    {
      if(user.access_level>access_levels.NORMAL)
      {
        console.log('User "%s[%s]", tried to create an account with elevated privilleges.', user, id);
        return;
      }
    }
    //generate vericode
    var vericode = require('./system/vericodes.js');
    vericode.add(user.usr, function(code, err)
    {
      //if vericode was created, create user
      user.pwd = crypto.createHash('sha1').update(user.pwd).digest('hex');
      user.active=false;
      Users.create(user, callback);
      //Send email with verification code
    });*/

		var newUser = new User.model();
    User.model.find()
              .exec()
              .then(function(users)
            {
              users.forEach(function(user)
              {
                var username = locals.formData.username;
                var password = locals.formData.password;
                var pwd = crypto.createHash('sha1').update(password).digest('hex');
                console.log(user+'\n');
                if(user.name==username && user.password==pwd)
                  console.log('found match');
              });
            }, function(err)
            {
              console.log(err);
            });

            res.end();
		//var updater = newUser.getUpdateHandler(req);

		/*updater.process(req.body,
			{
			flashErrors: true,
			fields: 'name, email, phone, enquiryType, message',
			errorMessage: 'There was a problem submitting your enquiry:',
			}, function (err)
			{
				if (err)
				{
					locals.validationErrors = err.errors;
				} else
				{
					locals.enquirySubmitted = true;
				}
				next();
			});*/
	});

  view.render('login');
};
