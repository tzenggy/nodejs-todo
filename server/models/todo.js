var mongoose = require('mongoose')



// Mongoose use the model method to create new model 
	// arg1: a string name for the collection
	// arg2: an object containing fields and its description (constraints) inside that document
		// default value is set using default property
		// required field is specified using required property
var Todo = mongoose.model('Todo', {
	text: {
		// type need to capitalized
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	completed: {
		type: Boolean,
		default: false
	},
	// we don't need a createdAt field because the timestamp of document creation is embedded in the ID.
	completedAt: {
		type: Number,
		default: null
	}
});

module.exports = {Todo};