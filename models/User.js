//need mongoose to interface
const mongoose = require('mongoose');
//global variable and using es6 Promise
mongoose.Promise = global.Promise; 

//makes nice urls
const slug = require('slugs');

//make schema
const Schema = mongoose.Schema;

const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
//manages sessions tokens authentication libesa
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email address.'],
    required: 'Please supply an email address.'
  },
  name: {
    type: String,
    required: 'Please supply a name.',
    trim: true
  }
});

//gravatar can be a virtual field
userSchema.virtual('gravatar').get(function(){
  //uses md5 it hashes the user's email address
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`
})
//passport middleware to deal with what is needed for an email/password schema. in this situation, using email
//from passportLocalMongoose exposes us to stuff like .register takes care all lowerlevel rego for us. 


userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);