const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '5a7b96055d416ac41d37b78211'; // this is the correct id
// // var id = '6a7b96055d416ac41d37b782'; // this is the wrong id
// // if the id doesn't match any of the document in the database, the query function will not raise an error but empty array or null


// if (!ObjectID.isValid(id)) {
// 	console.log('ID not found');
// }


// Todo.find({
// 	_id: id
// }).then((todos) => {console.log('Todos', todos)});

// // if findOne() doesn't find any result, it will return null rather than empty array in the case of find()
// Todo.findOne({
// 	_id: id
// }).then((todo) => {console.log('Todo', todo)});

// Todo.findById(id).then((todo) => {
// 	if (!todo) {
// 		return console.log('Id not found');
// 	}
// 	console.log('Todo By Id', todo);
// })
// // If the Id is of the wrong format or length, error will be raised, so we need catch to handle errors.
// .catch((err) => {
// 	console.log(err);
// });
// // There is another way to handle invalid id error: using ObjectID's ObjectID.isValid method


// Use User.findById
var userId = '5a7b240b6eead4cc21ed5e0c';
User.findById(userId).then((user) => {
	if (!user) {
		return console.log('User not found');
	}
	console.log('User', user)
})
.catch((e) => {console.log(e)});

