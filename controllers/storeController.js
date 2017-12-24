//for mongodb
const mongoose = require('mongoose');

//need access to the models (store). that's already required in the start.js file, so ...
//we just references it (b/c of the singleton: require once, reference several times)
//store because module.exports = mongoose.model('Store', storeSchema); i defined it there at bottom of store.js
const Store = mongoose.model('Store');
// handles when anyone requests the homepage
exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index')
}
//index will be in views

// routes file tells us what the urls we hit are. then we shell it off to a separate file to do the actual work

exports.addStore = (req, res)=> {
  // res.send('it works!')
  //make an edit template because it's the same
  res.render('editStore', {title: 'Add Store'})

}
//store created here in ES8's async await
exports.createStore = async (req, res) => {
  const store = new Store(req.body);
  //then fire off a connection to the mongodb database with .save();
  await store.save();
  res.redirect('/');
}
//^did not wrap in a try/catch because we are wrapping createStore in a fcn that catches errors