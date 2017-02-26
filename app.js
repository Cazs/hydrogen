var express = require('express');
var bodyParser = require('body-parser');

const app = express();

//init middle-ware
app.use(bodyParser.urlencoded({extended:true}));//init body-parser to convert url-encoded data to JSON data
app.use(express.static(__dirname + '/frontend'));//set main dir for the front-end

const mongoose = require('mongoose');
//My modules
const sessions = require('./models/system/sessions.js');
const errors = require('./models/system/error_msgs.js');
const access_levels = require('./models/system/access_levels.js');
const users = require('./models/users.js');

//Connect to mongoose
mongoose.connect('mongodb://localhost/hydrocar');
//globals
var db = mongoose.connection;
const SESSION_TTL = 60 * 30;//30 minutes
const PORT = 5000;
const APP_NAME = "Hydrogen Society server v1.0";

//Begin route handlers
app.get('/', function(req, res)
{
  res.end('use /api/*');
});

app.post('/api/user/add', function(req, res)
{
  users.ACCESS_MODE = access_levels.NO_ACCESS;//<---Check this out
  addObject(req, res, users);
});

addObject = function(req, res, obj_model)
{
  var obj = req.body;
  var session_id = req.headers.session;
  var session = sessions.search(session_id);

  res.setHeader('Content-Type','text/json');

  //validate obj
  if(!obj_model.isValid(obj))
  {
    errorAndCloseConnection(res, 503, errors.INVALID_DATA);
    return;
  }

  if(obj_model.ACCESS_MODE >= access_levels.NO_ACCESS)
  {
    obj_model.add(obj, function(err)
    {
      if(err)
      {
        errorAndCloseConnection(res, 500, errors.INTERNAL_ERR);
        logServerError(err);
        return;
      }
      res.json({'success':'200: Success'});
    });
  }else {
    if(session!=null)
    {
      if(!session.isExpired())
      {
        if(session.access_level>=obj_model.ACCESS_MODE)
        {
          obj_model.add(obj, function(err)
          {
            if(err)
            {
              errorAndCloseConnection(res, 500, errors.INTERNAL_ERR);
              logServerError(err);
              return;
            }
            res.json({'success':'200: Success'});
          });
        }else {
          errorAndCloseConnection(res, 502, errors.UNAUTH);
        }
      }else {
        errorAndCloseConnection(res, 501, errors.SESSION_EXPIRED);
      }
    }else{
      errorAndCloseConnection(res, 501, errors.SESSION_EXPIRED);
    }
  }
}

updateObject = function(req, res, obj_model)
{
  var obj_id = req.params.object_id;
  var obj = req.body;
  var session_id = req.headers.session;
  var session = sessions.search(session_id);

  res.setHeader('Content-Type','text/json');

  if(isNullOrEmpty(obj_id))
  {
    console.log('Invalid object: ' + obj_id)
    errorAndCloseConnection(res, 503, errors.INVALID_DATA);
    return;
  }
  if(!obj_model.isValid(obj))
  {
    console.log('Invalid object: ' + obj)
    errorAndCloseConnection(res, 503, errors.INVALID_DATA);
    return;
  }

  if(session!=null)
  {
    if(!session.isExpired())
    {
      if(session.access_level>=obj_model.ACCESS_MODE)
      {
        obj_model.update(obj_id, obj, function(err)
        {
          if(err)
          {
            errorAndCloseConnection(res, 500, errors.INTERNAL_ERR);
            logServerError(err);
            return;
          }
          res.json({'success':'200: Success'});
        });
      }else {
        errorAndCloseConnection(res, 502, errors.UNAUTH);
      }
    }else {
      errorAndCloseConnection(res, 501, errors.SESSION_EXPIRED);
    }
  }else{
    errorAndCloseConnection(res, 501, errors.SESSION_EXPIRED);
  }
}

getObject = function(req, res, obj_model)
{
  var obj_id = req.params.object_id;
  var session_id = req.headers.session;
  var session = sessions.search(session_id);

  if(isNullOrEmpty(obj_id))
  {
    errorAndCloseConnection(res,503,errors.INVALID_DATA);
    return;
  }

  res.setHeader('Content-Type','text/json');

  if(obj_model.ACCESS_MODE == access_levels.NO_ACCESS)
  {
    obj_model.get(obj_id, function(err, obj)
    {
      if(err)
      {
        errorAndCloseConnection(res,500,errors.INTERNAL_ERR);
        logServerError(err);
      }
      res.json(obj);
    });
  }else {
    if(session!=null)
    {
      if(!session.isExpired())
      {
        if(session.access_level>=obj_model.ACCESS_MODE)
        {
          obj_model.get(obj_id, function(err, obj)
          {
            if(err)
            {
              errorAndCloseConnection(res,500,errors.INTERNAL_ERR);
              logServerError(err);
            }
            res.json(obj);
          });
        }else {
          errorAndCloseConnection(res,502,errors.UNAUTH);
        }
      }else {
        errorAndCloseConnection(res,501,errors.SESSION_EXPIRED);
      }
    }else {
      errorAndCloseConnection(res,501,errors.SESSION_EXPIRED);
    }
  }
}

getAllObjects = function(req, res, obj_model)
{
  var session_id = req.headers.session;
  var session = sessions.search(session_id);

  res.setHeader('Content-Type','text/json');

  if(obj_model.ACCESS_MODE == access_levels.NO_ACCESS)
  {
    obj_model.getAll(function(err, objs)
    {
      if(err)
      {
        errorAndCloseConnection(res,500,errors.INTERNAL_ERR);
        logServerError(err);
      }
      res.json(objs);
    });
  }else {
    if(session!=null)
    {
      if(!session.isExpired())
      {
        if(session.access_level>=obj_model.ACCESS_MODE)
        {
          obj_model.getAll(function(err, objs)
          {
            if(err)
            {
              errorAndCloseConnection(res,500,errors.INTERNAL_ERR);
              logServerError(err);
            }
            res.json(objs);
          });
        }else {
          errorAndCloseConnection(res,502,errors.UNAUTH);
        }
      }else {
        errorAndCloseConnection(res,501,errors.SESSION_EXPIRED);
      }
    }else {
      errorAndCloseConnection(res,501,errors.SESSION_EXPIRED);
    }
  }
}

errorAndCloseConnection = function(res,status,msg)
{
  res.status(status);
  res.setHeader('Connection','close');
  res.json({'error':msg});
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

logServerError = function(err)
{
  //TODO: log to file
  console.error(err.stack);
}

/**** user authentication ****/
app.post('/api/auth',function(req, res)
{
  var usr = req.body.usr;
  var pwd = req.body.pwd;

  res.setHeader('Content-Type','text/json');

  //validate input from client
  if(isNullOrEmpty(usr) || isNullOrEmpty(pwd))
  {
    errorAndCloseConnection(res, 404, errors.NOT_FOUND);
    return;
  }

  //check if credentials match the ones in the database
  users.validate(usr, pwd, function(err, user)
  {
    if(err)
    {
      errorAndCloseConnection(res,500,errors.INTERNAL_ERR);
      logServerError(err);
    }
    if(user)
    {
      var session = sessions.newSession(user._id, SESSION_TTL, user.access_level);
      res.setHeader('Session','session=' + session.session_id + ';ttl=' + session.ttl +
                      ';date=' + session.date_issued);
      res.setHeader('Content-Type','text/plain');
      res.send(session.session_id);
    }else{
      errorAndCloseConnection(res,404,errors.NOT_FOUND);
    }
  });
});
//account activation
app.get('/api/activate/:user/:code', function(req, res)
{
  var vericode = require('./models/system/vericodes.js');
  vericode.validate(req.params.user, req.params.code, function(error, user)
  {
    if(user)
    {
      if(user.active)
      {
        //TODO: send email
        console.log('user "%s" has been successfully activated.');
        var mailjet = require ('node-mailjet').connect('f8d3d1d74c95250bb2119063b3697082', '8304b30da4245632c878bf48f1d65d92');

        var request = mailjet.post("send").request(
                      {
                          "FromEmail":"hydrogensociety1.008@gmail.com",
                          "FromName":"Hydrogen Society",
                          "Subject":"Test Mail #8",
                          "Text-part":"Hello H Society",
                          "Html-part":"<h3>Hello H Society</h3>",
                          "Recipients":[
                                  {
                                          "Email": "casperndlovu42@gmail.com"
                                  }
                          ]
                      },function(response, body)
                      {
                        if(response)
                          console.log ('Email server response: %s', response);
                        if(body)
                          console.log ('Email server response statusCode: %s', body.response.res.statusCode);
                      });
        //TODO: delete vericode
        res.end('200: success');
      }else{
        errorAndCloseConnection(res, 504, error_msgs.ACCOUNT_INACTIVE);
      }
    }else
    {
      errorAndCloseConnection(res, 504, error_msgs.ACCOUNT_INACTIVE);
    }
  });
});

app.listen(PORT);
console.log('..::%s is running on port %s::..', APP_NAME, PORT);
