const passport = require('passport');

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
  res.redirect('/')
}