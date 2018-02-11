const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// UserSchema define properties of the documents inside the collection
// we use mongoose built in constructor for schema
	// It's because we can't add method to User if User is created by mongoose.model
var UserSchema = new mongoose.Schema({
	email: {
		required: true,
		trim: true,
		type: String,
		minlength: 1,
		unique: true,
		validate: {
			// validator is a function that returns true if the value is valid and false if the value is not valid
			// This is the same as validator: validator.isEmail,
			validator: (value) => {
				return validator.isEmail(value);
			}, 

			message: '{VALUE} is not a valid email'
		}
	},
	password: {
		type: String,
		require: true,
		minlength: 6
	},
	// This is the syntax for mongoose
	// tokens contains array of user tokens
	tokens: [{
		access: {
			type: String,
			require: true
		},
		token: {
			type: String,
			require: true
		}
	}]
}, {
	usePushEach : true});


// this function determines which value will be sent back in the JSON object
// 	becasue we don't want to confidential info of the server, ie password or the token
UserSchema.methods.toJSON = function () {
	var user = this;
	// user.toObject() convert document in the mongo db into an object
	var userObject = user.toObject();
	return _.pick(userObject, ['_id', 'email']);
}


// UserSchema.methods is an object in which we can add any methods we like
	// These methods are instance methods
// UserSchema.methods
// We use regular function declaration instead of arrow function because arrow function doesn't bind this key word, but we need this for extracting 
// individual data
	// we can have  var user = this; which is much clearer than using this
UserSchema.methods.generateAuthToken = function () {
	var user = this;

	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access}, 'secretvalue1').toString();

	// user.tokens.push({access, token});
	//	// for some reasons this works instead of the above
	user.tokens = user.tokens.concat([{access, token}]); 

	// again user.save returns a promsie after which we can chain then()
	// we return the would-be-returned token variable to the caller of this method
	return user.save().then(() => {
		// return token because we can chain another then that takes an argument of token
		return token;
	// }).then((token) => {})
	});
};

var User = mongoose.model('User', UserSchema);

module.exports = {User};