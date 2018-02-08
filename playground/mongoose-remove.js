const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// // Todo.remove
// // to remove everything using .remove, we need an argument like Todo.remove({})
// Todo.remove({}).then((result) => console.log(result));

//Todo.findOneAndRemove
// this gets the removed document back

//Todo.findByIdAndRemove
// this also return the doc by id
Todo.findByIdAndRemove('5a7c9c934f9bc5059efa8237').then((todo) => {
	console.log(todo);
})