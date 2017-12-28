const mongoose = require('mongoose');

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
  req.checkBody('password-conform', 'Oops. Your passwords did not match.').equals(req.body.password);
  const errors = req.validationErrors();
  if(errors){
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {title: 'register', body: req.body, flashes: req.flash()});
    return;
  }
  next();//there were no errors
};

exports.register = async (req, res, next) =>{
  
}