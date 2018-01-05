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
},
{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}//so we can use pre dump
}
);
//define the indexes
//this creates a compound index and will allow us to look up one term that could appear in both. 
storeSchema.index({
  name: 'text', 
  description: 'text'
})
storeSchema.index({location: '2dsphere'})

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

storeSchema.statics.getTopStores = function(){
  return this.aggregate([
//lookup stores and populate reviews (mondodb took "Review" and made it'reviews)
{ $lookup: {from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews'} },
//filter for only items that have 2 or more reviews
//sees if there is a 2nd rewview (index 1) and if so, it's matched / shown only those
{ $match: { 'reviews.1': { $exists: true} }},
//add the average reviews field
{ $project: {
  photo: '$$ROOT.photo',
  name:'$$ROOT.name',
  reviews: '$$ROOT.reviews',
  slug: '$$ROOT.slug',
  averageRating: { $avg: '$reviews.rating'}
}},
//sort by our new field h to l
{ $sort: { averageRating: -1} },
{ $limit: 10}
//limit to 10
  ])
}
//find reviews where the store's _id property === review's store property
//note: virtual won't go to a json obj unless explicitly told to do so ( we are doing it for dot dump)
storeSchema.virtual('reviews', {
  //go to another model and do a quick query
  ref: 'Review',//and what model to link
  localField: '_id', //which field on the store
  foreignField: 'store'// which field on the review
})
function autopopulate(next){
  this.populate('reviews')
  next();
}
storeSchema.pre('find', autopopulate)
storeSchema.pre('findOne', autopopulate)
//for exporting an object (vs fcn) use module.exports
module.exports = mongoose.model('Store', storeSchema);