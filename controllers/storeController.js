//for mongodb
const mongoose = require('mongoose');

//for dealing with files accepted ...
const multer = require('multer');
//for resizing and making file names unique
const jimp = require('jimp');
const uuid = require('uuid');

//read photo into storage and check that it's allowed
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      next(null, true);
    } else {
      next({ message: 'That filetype is not allowed.'}, false);
    }
  }
}


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
//middleware for working with createstore, reads it into memory temp bec we will resize it
exports.upload = multer(multerOptions).single('photo');
exports.resize = async (req, res, next) =>{
  //scheic if there is no new file to resize
  if(!req.file){
    next();
    return;
  }
  else {
    // console.log(req.file);
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    //resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    //now to write it
    await photo.write(`./public/uploads/${req.body.photo}`);
    // once we hae written the photo to our filesystem, eep going
    next(); 
  }
}

//store created here in ES8's async await
exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  //then fire off a connection to the mongodb database with .save();
  //awaiting and saving together so that we wait for that save before slug is generated
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}
//^did not wrap in a try/catch because we are wrapping createStore in a fcn that catches errors
exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
};

//display the stores on the page (home) and when i visit store's page. so need a controller to run on both of those routes (home and the indiv store's page)
exports.getStores = async (req, res) => {
  //query db for a list of all stores
  //.find() will query db for all of them. deal with pagination later
  //save in a database by setting a var. store.find creates a promise, so need to await it
  const stores = await Store.find();
  // console.log(stores);
  res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
  // 1. find the store given the ID
    //req has params which will give me any parameters that have come thru the url
    // res.json(req.params)
    const store = await Store.findOne({ _id: req.params.id})
    // res.json(store);
  // 2. confirm the user is the owner of the store
  // 3. render out the edit form so that the user can update their store
    res.render('editStore', { title: `Edit ${store.name}`, store})
}

exports.updateStore = async (req, res) =>{
  //set the location data to be a point
  req.body.location.type = "Point";
  //find and update store
  //findOneAndUpdate({}) takes three args: query data and options
  const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, 
    {
    new: true,//returns new store instaed of old one
    runValidators: true,
    }).exec();

     //tell them it worked
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View store</a>`);
    //redirect
    res.redirect(`/stores/${store._id}/edit`);

}