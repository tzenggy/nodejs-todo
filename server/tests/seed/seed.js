const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const todos = [{
	_id: new ObjectID(),
	text: 'Postman task1'
}, {
	_id: new ObjectID(),
	text: 'Postman task2',
	completed: true,
	completedAt: 123
}, {
	_id: new ObjectID(),
	text: 'Postman task3'
}, {
	_id: new ObjectID(),
	text: 'Postman task4',
	completed: true,
	completedAt: 3333
}];


const populateTodos = (done) => {
	// this removes the collection to ensure the tests after can work properly
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);	
	}).then(() => done());
};

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
	// _id: new ObjectID(), // We need the id for token again, so we need to create a variable to store that value
	_id: userOneId,
	email: 'user1@example.com',
	password: 'useronepassword',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userOneId, access: 'auth'}, 'secretvalue1').toString()
	}]
}, {
	_id: userTwoId,
	email: 'user2@example.com',
	password: 'usertwopassword'
}];

const populateUsers = (done) => {
	User.remove({}).then(() => {
		// Here we use different way of inserting documents into the collection because insertMany will not trigger the pre(save) middleware,
		// and the plain text password will be stored inside documents
		var userOne = new User(users[0]).save();
		var userTwo = new User(users[1]).save();

		// Promise.all takes an array of promises and wait until all the promises are done before executing their then calls
		return Promise.all([userOne, userTwo]).then(() => {});
	}).then(() => {done()})
};

module.exports = {todos, populateTodos, users, populateUsers};