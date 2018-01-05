//for mongodb
const mongoose = require('mongoose');
//need access to the models (store). that's already required in the start.js file, so ...
//we just references it (b/c of the singleton: require once, reference several times)
//store because module.exports = mongoose.model('Store', storeSchema); i defined it there at bottom of store.js
const Store = mongoose.model('Store');
const User = mongoose.model('User');
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
  //author points to logged in user
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  //then fire off a connection to the mongodb database with .save();
  //awaiting and saving together so that we wait for that save before slug is generated
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}


//^did not wrap in a try/catch because we are wrapping createStore in a fcn that catches errors
exports.getStores = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 4;
  const skip = (page * limit) - limit;

  // 1. Query the database for a list of all stores
  const storesPromise = Store
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!stores.length && skip) {
    req.flash('info', `Oops! Page ${page} doesn't exist. You're redirected to ${pages}`);
    res.redirect(`/stores/page/${pages}`);
    return;
  }

  res.render('stores', { title: 'Stores', stores, page, pages, count });
};


const confirmOwner = (store, user) => {
  //.equals is a method that comes along
  if(!store.author.equals(user._id)){
    throw Error('You must own a store to edit it.')
  }
}

exports.editStore = async (req, res) => {
  // 1. find the store given the ID
    //req has params which will give me any parameters that have come thru the url
    // res.json(req.params)
  const store = await Store.findOne({ _id: req.params.id})
    // res.json(store);
  // 2. confirm the user is the owner of the store
  confirmOwner(store, req.user)
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

exports.getStoreBySlug = async (req, res, next) => {
  // res.send("it works")
  // res.json(req.params);
  const store = await Store
  .findOne({slug: req.params.slug})
  .populate('author reviews')
  //see what we get back: 
  // res.json(store);
  //for when there's a url that isn't a store. get null. deal with it:
  if (!store) return next();
  res.render('store', {store, title: store.name})
}

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  //either the tag chosen or everything that has a tag
  const tagQuery = tag || { $exists: true, $ne: [] };

  //get tags list
  const tagsPromise = Store.getTagsList();

  const storesPromise = Store.find({ tags: tagQuery });

  // to await promises that need to be done before rendering
  //const result = await Promise.all([tagsPromise, storesPromise])
  //destructured (could've bee var tags = result[0] and var stores = result[1])
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  // res.json(stores)

  res.render('tag', { tags, title: 'Tags', tag, stores });
};

exports.searchStores = async (req, res) => {
  // res.json(req.query)
  const stores = await Store
  //first
  .find({
    //use mongodb text search
    $text: {
      $search: req.query.q
    }
  },//metadata
  {
    score: { $meta: 'textScore'}
  })
  .sort({
      score: {$meta: 'textScore'}
    })
    //limit to number
  .limit(5)
  res.json(stores)
}

exports.mapStores = async (req, res) => {
  //needsa an array of numbers that are coords. in mongo, it's lng lat. also parse them to numbers
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat)
  //make the query $near and $geometry are part of mongodb. saweeeet
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 //10km
      }
    }
  }
  //find stores using query and return only what is in .select() 
  //this trims the fat from the ajax return
  const stores = await Store.find(q).select('slug name location description photo').limit(10);
  res.json(stores)
}

exports.mapPage = (req, res) =>{
  res.render('map', {title: 'Map'})
}

exports.heartStore = async (req, res) => {
  //toggle: if they have a heart on a store, then clickng heart will undo (unlike). if they do not, then adds a heart
  //get an array of hearts. we pass in an obj and do mongodb magic with mdb's toString
  const hearts = req.user.hearts.map(obj => obj.toString())
  //make an operator that either take out of or put into (so if the store's id is in or not)
  //addToSet keeps it unique
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet'
  const user = await User
  .findByIdAndUpdate(req.user._id,
    { [operator]: { hearts: req.params.id} },
    { new: true }
  )
  res.json(user)
}

exports.getHearts = async (req, res) => {
  const stores = await Store.find( {
    _id: { $in: req.user.hearts}
  })
  res.render('stores', { title: 'Hearted Stores', stores})
}

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  // res.json(stores)
  res.render('topStores', { stores, title:'⭐ Top Stores!'});
}