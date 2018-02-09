var mongoose = require('mongoose');

// Unlike MongoClient which uses Callback, Mongoose can use Promise (but it supports callback by default).
// This line of code tells mongoose to use the built-in library for Promise, not some third party libraries.
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI/* || 'mongodb://tzenzachary:marchtenth0310@ds229878.mlab.com:29878/todoapp'*/);	

module.exports = {mongoose};