const passport = require('passport');
const crypto = require('crypto');


//need to send passport data and tell us if we should be logged in or not: a strategy. intefaces to check if you're allowed to be logged in. we are using local strategy
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
    resetPasswordExpires: { $gt: Date.now()}
  })
  if(!user){
    req.flash('error', "Password reset is invalid or expired.")
    return res.redirect('/login')
  }
  // res.render('reset', { title: 'Reset your password.'})
}

exports.forgot = async (req, res) => {
  //see if user with that email exists
  const user = await User.findOne({ email: req.body.email})
  if(!user){
    req.flash('error', "A password reset has been mailed to you.")
    res.redirect('/login')
    //this white lie is better than announcing that no user exists. 
  }
  //set resest tokens and expiry on their acct
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  //send email with token

  //redirect to login page
}