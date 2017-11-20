var mongoose = require('mongoose')
var bcrypt = require('bcrypt')
SALT_WORK_FACTOR = 10;

var reasons = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

var UserSchema = mongoose.Schema({
  username : { type: String, required: true, index: { unique: true } },
  password : { type: String, required: true }
});

//Generating salt and hashing password before save
UserSchema.pre('save', function(next){
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
    if(err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash){
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.statics.getAuthenticated = function(username, password, callback){
  this.findOne({ username: username }, function(err, user){
    if(err) return cb(err);

    if(!user){
      return callback(null, null, reasons.NOT_FOUND);
    }

    user.comparePassword(password, function(err, isMatch){
      if(err) return callback(err);

      if(isMatch){
        return callback(null, user);
      }

    });

  });
}

UserSchema.methods.comparePassword = function(candidatePassword, callback){
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
    if(err) return callback(err);
    callback(null, isMatch);
  });
}

module.exports = mongoose.model('User', UserSchema);
