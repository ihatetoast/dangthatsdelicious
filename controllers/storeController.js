
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
exports.createStore = (req, res) => {
  res.json(req.body);
}