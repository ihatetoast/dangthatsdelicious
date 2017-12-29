const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login'});
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register'});
};

//middleware for checks
exports.validateRegister = (req, res, next)=>{
  //sanitize name (app.use express validator)
  //call diff validation methods
  req.sanitizeBody('name');
  req.checkBody('name', "You must supply a name").notEmpty();
  req.checkBody('email', "That email is not valid").isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', "Password cannot be blank.").notEmpty();
  req.checkBody('password-confirm', "Confirm password cannot be blank").notEmpty();
  req.checkBody('password-confirm', 'Oops. Your passwords did not match.').equals(req.body.password);
  const errors = req.validationErrors();
  if(errors){
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {title: 'register', body: req.body, flashes: req.flash()});
    return;
  }
  next();//there were no errors
};

exports.register = async (req, res, next) =>{
  const user = new User({email: req.body.email, name: req.body.name});
  //see User.js for explanation

  //.regiser library doesn't promises, so use callback. 
  //this is where promisify comes in
  //make the method that is promisified
  // take promisify, pass two things: method to promisify (User.register) and because it's a method and not a top-level fcn, yi have to tell it what obj to bind to. in this case: User
  const register = promisify(User.register, User);
  //takes the password and stores the hash. NEVER STORE USER'S PASSWORD IN DB
  await register(user, req.body.password);
  // res.send("yo, it works!");
  next();
  //move to automatically login
}