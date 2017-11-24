const express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var session = require('express-session')
var morgan = require('morgan')

var jwt = require('jsonwebtoken')
var config = require('./config')
var User = require('./app/models/user')

const app = express()
var apiRoutes = express.Router()

app.set('secret', config.secret);
mongoose.connect(config.database);

//Parsing JSON and urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//Logging requests to console
app.use(morgan('dev'));

app.use(session({
  secret: 'work hard',
  resave: true,
  cookie: { maxAge: 500000 },
  saveUnitialized: false
}));

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

apiRoutes.get('/', (req, res) => {
  res.json({ success: true, message: "<h1>You're on the root path</h1>"});
})

apiRoutes.post('/users/signin', function(req, res){
  username = req.body.username
  password = req.body.password
  User.getAuthenticated(username, password, function(err, user, reason){
    if(err) throw err;

    if(user){
      const payload = { username: user.username, admin: user.admin };
      var token = jwt.sign(payload, app.get('secret'),{
        expiresIn: '24h'
      });
      console.log('Login Successful');
      res.json({
        success: true,
        message: "Enjoy your token!",
        token: token
      });
    }else{
      res.json({
        success: false,
        message: 'Authentication failed! Wrong user or password'
      });
    }
  });
});

apiRoutes.post('/users/create', function(req, res){
  username = req.body.username
  password = req.body.password
  admin = false
  if(req.body.admin){
    admin = true
  }
  if(valid(username, password)){
    var newUser = new User({ username: username, password: password, admin: admin });
    newUser.save(function(err){
      if(err) throw err;
    });
    res.send("User registered!");
  }else{
    res.send("Username or password undefined");
  }
});

//Middleware to validate JWT
apiRoutes.use((req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token){
    jwt.verify(token, app.get('secret'), (err, decoded) => {
      if(err){
        return res.json({ success: false, message: 'Failed to authenticate token'});
      }else{
        req.decoded = decoded;
        next();
      }
    });
  }else{

    return res.status(403).send({
      success: false,
      message: 'No token provided'
    });

  }
});

apiRoutes.post('/users/admin/create', (req, res) => {
  var admin = req.decoded.admin;
  if(admin){
    var username = req.body.username
    var password = req.body.password
    var admin = false
    if(req.body.admin){
      admin = true
    }
    if(valid(username, password)){
      var newUser = new User({ username: username, password: password, admin: admin });
      newUser.save((err) => {
        if(err) throw err;
      });
      if(newUser.errors) res.json({ success: false, message: "Errors on creation"});
      else res.json({ success: true, message: "User created!"});
    }else{
      res.json({ success: false, message: "Username or Password set incorrectly"});
    }
  }else{
    res.json({ success: false, message: "You're not an admin user"});
  }
});

apiRoutes.get('/users', (req, res) => {
  var admin = req.decoded.admin;
  if(admin){
    User.listUsers((err, users) => {
      if(err) res.json({ success: false, message: err });
      res.json({ success: true, users: users });
    });
  }else{
    res.json({ success: false, message: "You're not an admin user"});
  }
});


/*apiRoutes.post('/logout', function(req, res){
  //var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token){
    token.destroy(function(err){
      if(err){
        return next(err);
      } else{
        return res.send('Logged out!');
      }
    });
  }
});*/

apiRoutes.get('/home', function(req, res){
  res.send("<h1>This is your home page</h1>");
});

app.use('/api', apiRoutes)
app.listen(3000, () => console.log("Example app listening on port 3000"))
