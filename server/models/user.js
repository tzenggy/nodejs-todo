const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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

UserSchema.methods.removeToken = function (token) {
	// $pull mongoose methods that remove some items that satisfy certain criteria
	var user = this;

	return user.update({
		$pull: {
			tokens: {
				// the entire token object will be removed if token is found
				// token: token
				token
			}
		}
	})
};

// .statics creates a model method (static method of the model) 
// again use function () {} because we need this binding
UserSchema.statics.findByToken = function (token) {
	// call this variable User because it represents the User model, not just any instance of the User model
	var User = this;
	// decoded will store the decoded jwt value => return result of jwt.verify
	var decoded;

	// Use try catch block because jwt.verify will return an error if anything goes wrong
		// ie, manipulated token, wrong password, ...
	try {
		decoded = jwt.verify(token, 'secretvalue1');
	} catch (e) {
		//	// return because we don't want what's after the try catch block to run if jwt.verify fails
		// return new Promise((resolve, reject) => {
		// 	reject();
		// })
		// 	// The above is the same as 
		//	// This reject can take an argument that will be the error object in the function that chain this promise
		return Promise.reject();
	}

	// findOne returns a promise. If we want to chain it we can return it to the caller of this method
	return User.findOne({
		_id: decoded._id,
		// nested key in an array
		'tokens.token': token,
		'tokens.access': 'auth'
	})
};

// Check user's login info. Return a promise of user or error properly
	// include authentication proof (token)
// need to return promise (resolve or reject)
UserSchema.statics.findByCredentials = function (email, password) {
	// we need a user schema variable to access different search methods
	var User = this;

	return User.findOne({email}).then((user) => {
		if (!user) {
			return Promise.reject();
		}
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					resolve(user);
				} else {
					reject();
				}

				/*
				// want to resolve only if res is true!! not the other way around
				if (err) {
					return Promise.reject();
				}
				return Promise.resolve(user);
				*/
			});
		});
		/*
		// all bcrypt methods support only callback, not promise
			// to return promise, need to return a newly constructed promise object
				// new Promise((resolve, reject) => {})
		bcrypt.compare(password, user.password, (err, result) => {
			if (err) {
				return Promise.reject();
			}
			// res.status(200).send(user);
			return Promise.resolve(user);
		});
		*/
	});
};


// At this point the POST request header will contain the plain text version of the password
UserSchema.pre('save', function (next) {
	var user = this;

	// if the user modifies the password, this password will have to be plain text, and we need to hash it again
	if (user.isModified('password')) {
		bcrypt.genSalt(5, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			})
		})

	} else {
		next();
	}
})

var User = mongoose.model('User', UserSchema);

module.exports = {User};