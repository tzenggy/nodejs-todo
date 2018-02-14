require('./config/config');

var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const bcrypt = require('bcryptjs');
const _ = require('lodash');


var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// This url is the convention for HTTP Post request of making a new todo
app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {res.send(doc)}, (e) => {res.status(400).send(e);});
});

app.get('/todos', (req, res) => {
	// this todos returned a array in the success case of then
	Todo.find().then((todos) => {
		// if we find all the todos, we want to send the info out
		// object is a better data structure than array because
		// object can add additional properties, ie status code, 
		// while array cannot achieve the same
		res.send({todos})
	}, (err) => {
		res.status(400).send(e);
	});
});

app.get('/todos/:id', (req, res) => {
	var id = req.params.id;
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	Todo.findById(id).then((todo) => {
		if (!todo) {
			res.status(404).send();
		}
		res.status(200).send({todo});
	}, (e) => {
		res.status(400).send();
	}).catch((e) => {res.status(400).send()});
});

app.delete('/todos/:id', (req, res) => {
	var id = req.params.id;
	if (!ObjectID.isValid(id)) {
		return res.status(404).send("invalid id");
	}
	Todo.findByIdAndRemove(id).then((todo) => {
		// if no doc is removed the function findByIdAndRemove will still return a success
		if (!todo) {
			return res.status(404).send("empty todo");
		}
		res.status(200).send({todo});
	}/*, (e) => {
		return res.status(400).send("error");
	} don't need the second error handling, simply use catch */).catch((e) => {
		res.status(400).send("error");
	});
});

app.patch('/todos/:id', (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findByIdAndUpdate(id, {
		$set: body
	}, {
		new: true
	}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		res.status(200).send({todo});
	}).catch((e) => {
		res.status(400).send();
	});
});

// We will define model method and instance method
	// model method is like static method of a model
		// ie, findByToken
	// instance method is like regular method of a class
		// ie, generateAuthToken is an instance method


app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	// user.save().then((user) => {res.send(user)}, (err) => {res.status(400).send(err)});
	// model.save returns a promise
		// generate tokens only after user is successfully created
	user.save().then((user) => {
		return user.generateAuthToken();
		// res.send(user)
	}).then((token) => {
		// header() takes a key value pair for its arguments
			// they are what we want to store in the header of the request
		// when the key of a header pair starts with 'x-' it means this key value pair is a custom header pair
			// meaning that this is not standard HTTP header but one for our own purposes
		res.header('x-auth', token).send(user);
	})
	.catch((err) => {
		res.status(400).send(err)
	});
});

// // // // This is moved to another file authenticate.js
// var authenticate = (req, res, next) {
// 	// different from res.header() where we set the header key-value pair, req.header() gets the header info so we only supply the key name
// 	var token = req.header('x-auth');

// 	// This model method will find the appropriate user based on the token info in the request header
// 	// check that the token is correct
// 	User.findByToken(token).then((user) => {
// 		// We want to call res.status(401).send() but since this line already exists in the catch block, we can reject here and let catch block catch it
// 		if (!user) {
// 			return Promise.reject();
// 		}
// 		// // rather than sending the user back, we want to update body of the request
// 		// res.send(user);
// 		req.user = user;
// 		req.token = token;
// 		next();
// 	})
// 	.catch((e) => {
// 		// 401 means authentication didn't succeed
// 		res.status(401).send();
// 	});
// }

// this will be private route which requires authentication to see
// add middleware name after the route string
app.get('/users/me', authenticate, (req, res) => {

	//	in the middleware user stores all the desired properties to return
	res.send(req.user);

	// // // This will be reused by having it inside a middleware

	// // different from res.header() where we set the header key-value pair, req.header() gets the header info so we only supply the key name
	// var token = req.header('x-auth');

	// // This model method will find the appropriate user based on the token info in the request header
	// // check that the token is correct
	// User.findByToken(token).then((user) => {
	// 	// We want to call res.status(401).send() but since this line already exists in the catch block, we can reject here and let catch block catch it
	// 	if (!user) {
	// 		return Promise.reject();
	// 	}
	// 	res.send(user);
	// })
	// .catch((e) => {
	// 	// 401 means authentication didn't succeed
	// 	res.status(401).send();
	// });
});

app.post('/users/login', (req, res) => {

// app.post('users/login', (req, res) => {

// 	// res.send("abc");
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) => {
		// then((token)...) needs to be appended after the method that returns a token promise
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).status(200).send(user);
		});
	})
	.catch((err) => {
		res.status(400).send();

	});

	// // This method doesn't return the proper token for access other parts of the web app
	// // Use another Model method for properly handle this
	// User.findOne({email}).then((user) => {
	// 	bcrypt.compare(password, user.password, (err, result) => {
	// 		if (err) {
	// 			return res.status(404).send(err);
	// 		}
	// 		res.status(200).send(user);
	// 	});
	// })
	// .catch((err) => res.status(400).send(err));

});


app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};