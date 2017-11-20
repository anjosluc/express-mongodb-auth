const express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var session = require('express-session')
//var mid = require('./middleware.js')
var User = require('./models/user.js')

const app = express()
var apiRoutes = express.Router()

//Parsing JSON and urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(session({
  secret: 'work hard',
  resave: true,
  cookie: { maxAge: 500000 },
  saveUnitialized: false
}));

mongoose.connect('mongodb://localhost/mydb')

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("DB connected");
});


var valid = function(username, password){
  if(username && password){
    if(password.match(/(\w|\W){6,15}/) != null){
      return true;
    }
  }
  return false;
}

apiRoutes.post('/signin', function(req, res){
  username = req.body.username
  password = req.body.password
  User.getAuthenticated(username, password, function(err, user, reason){
    if(err) throw err;

    if(user){
      console.log('Login Successful');
      req.session.userId = user._id;
      res.send("User on DB");
    }else{
      res.send("Not on DB");
    }
  });

});

apiRoutes.get('/home', function(req, res){
  res.send("This is your home page");
})

apiRoutes.post('/signup', function(req, res){
  username = req.body.username
  password = req.body.password
  if(valid(username, password)){
    var newUser = new User({ username: username, password: password });
    newUser.save(function(err){
      if(err) throw err;
    });
    res.send("User registered!");
  }else{
    res.send("Username or password undefined");
  }
});

apiRoutes.post('/logout', function(req, res){
  if(req.session){
    req.session.destroy(function(err){
      if(err){
        return next(err);
      } else{
        return res.send('Logged out!');
      }
    });
  }
});

var requiresLogin = function(req, res, next){
  if(req.session && req.session.userId){
    return next();
  }else{
    var err = 'You must be logged in to view this page';
    //err.status = 401;
    return next(err);
  }
};

app.use('/home', requiresLogin);
app.use('/', apiRoutes)
app.listen(3000, () => console.log("Example app listening on port 3000"))
