//models are what we use to store data in db

//use strict for mongo

//need mongoose to interface
const mongoose = require('mongoose');
//global varaible and using es6 Promise
mongoose.Promise = global.Promise; 

//makes nice urls
const slug = require('slugs');
//with mongodb, indexing is sort of a preread so that in a search, mdb doesn't have to look over everything. but indices needs to be set up using the schema (look after the schema, it has to be def first)
//make schema.
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
  tags:[String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates:[{
      type: Number,
      required: "Must supply coordinates"
    }],
    address: {
      type: String, 
      required: 'Must supply address'
    }
  },
  photo: String,
  //create the relationship between the store and the user. points to the user
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
});
//define the indexes
//this creates a compound index and will allow us to look up one term that could appear in both. 
storeSchema.index({
  name: 'text', 
  description: 'text'
})

//advanced functions done in the store schema pre hooks.

storeSchema.pre('save', async function(next){
  //oly if store's name is modified
  if(!this.isModified('name')){
    next();//skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  //dealing with name repeats by adding -next number: katy, katy-1, katy-2 ...
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')

  //problem: have not made store, so can't use store. to find duplicates
  //this.contructor because in the process of making the store ot after
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx })
  //if there was a result in findingi store with thic new store's name ...
  //add 1 to the number length. if there's katy, then katy-1. if there's katy, katy-1, then katy-2:
  if(storesWithSlug.length){
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`
  }

  next();
  //
})

storeSchema.statics.getTagsList = function() {
  //using this, so noooo fat arrow
  //we are using this so we can get functions that are bound to our model

  //agg takes an array of possible operators. see mongodb docs. pipeline ops. start with $.
  return this.aggregate([
    //first one used is$unwind. this will sort of sort by tags. if a store has two tags, it'll be listed twice, once per tag\
    { $unwind: '$tags'},
    { $group: { _id: '$tags', count: { $sum: 1}}},
    { $sort: { count: -1}}

  ]);
}


//for exporting an object (vs fcn) use module.exports
module.exports = mongoose.model('Store', storeSchema);