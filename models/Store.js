//use strict for mongo

//need mongoose to interface
const mongoose = require('mongoose');
//global varaible and using es6 Promise
mongoose.Promise = global.Promise; 

//makes nice urls
const slug = require('slugs');

//make scheme
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name'
  },
  slug: String,
  description: {
    type: String, 
    trim: true
  },
  tags:[String]

});


storeSchema.pre('save', function(next){
  //oly if store's name is modified
  if(!this.isModified('name')){
    next();//skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  next();
  //TODO make more resiliant to avoid repeats
})



//for exporting an object (vs fcn) use module.exports
module.exports = mongoose.model('Store', storeSchema);