var keystone = require('keystone');

exports = module.exports = function(req, res)
{
  var locals = res.locals;

  var view = new keystone.View(req, res);
  view.render('team');
}
