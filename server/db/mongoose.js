var mongoose = require('mongoose');

// Unlike MongoClient which uses Callback, Mongoose can use Promise (but it supports callback by default).
// This line of code tells mongoose to use the built-in library for Promise, not some third party libraries.
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/TodoApp');	

module.exports = {mongoose};