
// handles when anyone requests the homepage
exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index')
}
//index will be in views

// routes file tells us what the urls we hit are. then we shell it off to a separate file to do the actual work

