var requiresLogin = function(req, res, next){
  if(req.session && req.session.userId){
    return next();
  }else{
    var err = new Err('You must be logged in to view this page');
    err.status = 401;
    return next(err);
  }
};
