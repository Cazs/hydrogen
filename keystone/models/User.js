var keystone = require('keystone');
var mongoose = require('mongoose');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
	password: { type: Types.Password, initial: true, required: true },//Admin UI password, (I'm guessing they're using bcrypt)
	pwd: { type: String, initial: true, required: true },//Web Dashboard, encrypted using SHA1
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function ()
{
	return this.isAdmin;
});

User.addNew = function(user, callback)
{
	var UserModel = mongoose.model('User');
	UserModel.create(user, callback);
};


/**
 * Relationships
 */
User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });


/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin';
User.register();
