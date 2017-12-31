const passport = require('passport')
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const promisify = require('es6-promisify')
const mail = require('../handlers/mail')

//need to send passport data and tell us if we should be logged in or not: a strategy. interfaces to check if you're allowed to be logged in. we are using local strategy
//need to put user obj on each req. passport.js handler
exports.login = passport.authenticate('local', { 
  //if a failure. redirect (to login)
  failureRedirect: '/login',
  failureFlash: 'Failed login',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
})

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out.');
  res.redirect('/');
}
//middleware to check if the person is logged in. cannot add unless logged in
exports.isLoggedIn = (req, res, next) => {
  //is user auth
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash('error', "Oh noes. You must be logged in.")
  res.redirect('/login');
}

//resetting password with passport. keep!
//$gt = greater than
exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    //rPE is an hour from the requested Date.now(), so if it's $gt than now, we're still good
    resetPasswordExpires: { $gt: Date.now()}
  })
  if(!user){
    req.flash('error', "Password reset is invalid or expired.")
    return res.redirect('/login')
  }
  res.render('reset', { title: 'Reset your password.'})
}

exports.forgot = async (req, res) => {
  //see if user with that email exists
  const user = await User.findOne({ email: req.body.email})
    if(!user){
      req.flash('success', "A password reset has been mailed to you.")
      res.redirect('/login')
    //this white lie is better than announcing that no user exists. 
  }
  //set resets tokens and expiry on their acct
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  //send email with token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`
  await mail.send({
    user,
    filename: 'password-reset',
    subject: 'Password reset',
    resetURL
  })

  req.flash('success', `You have been emailed a password reset link.`)
  //redirect to login page
  res.redirect('/login')
}
exports.confirmedPasswords = (req, res, next) => {
  if(req.body.password === req.body['password-confirm']){
    next();//move on
    return;
  }
  req.flash('error', "Passwords do not match")
  res.redirect('back')
}
exports.update = async (req, res) => {
  //find user and make sure they are still within the hour in the token.
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  //not a promise but a callback, so use promisify
  const setPassword = promisify(user.setPassword, user)
  await setPassword(req.body.password)
  //now need to get rid of old token and expire. do that in mongodb by setting to undefined
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  //now auto login
  await req.login(updatedUser);
  req.flash('success', 'Huzzah! Your password has been reset!')
  res.redirect('/')
}

