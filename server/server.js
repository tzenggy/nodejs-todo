var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');


var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

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


app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};