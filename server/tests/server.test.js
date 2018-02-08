const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');


// we need a dummy array of todos for testing GET /todos because we assume the database isn't empty
const todos = [{
	// adding _ad and ObjectID constructor make the id available
	_id: new ObjectID(),
	text: 'Postman task1'
}, {
	_id: new ObjectID(),
	text: 'Postman task2'
}, {
	_id: new ObjectID(),
	text: 'Postman task3'
}, {
	_id: new ObjectID(),
	text: 'Postman task4'}];



// beforeeach() takes a function which has done as its argument
// beforeeach is called before each test is run
	// can be used to setup test database
beforeEach((done) => {
	// this removes the collection to ensure the tests after can work properly
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);	
	}).then(() => done());
});

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = 'Test todo text';

		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			// this is a custom expect assertion
			// it takes in a function with res as its argument
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			// this check if there is any error during the assertion
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				// this Todo is a model object so its find method return everything document if successful
				Todo.find({text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((e) => done(e));
			});
	});

	it('should not create to with invalid body data', (done) => {
		var text = '   ';

		request(app)
			.post('/todos')
			.send({text})
			.expect(400)
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				Todo.find().then((todos) => {
					expect(todos.length).toBe(4);
					done();
				}).catch((e) => done(e));
			});
	});

});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(4);
			})
			// we don't need to have error handling ability for get because we are just reading what's in the db
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should return todo doc', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				// console.log('abc');
				// console.log(res.body);
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	it('should return 404 if todo not found', (done) => {
		var hexId = new ObjectID().toHexString();
		request(app)
			.get(`/todos/${hexId}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 for non-object ids', (done) => {
		request(app)
			.get(`/todos/123`)
			.expect(404)
			.end(done);
	})
});

// describe('DELETE /todos/:id', () => {
// 	it('should return deleted doc', (done) => {
// 		request(app)
// 			.delete(`/todos/${todos[3]._id.toHexString()}`)
// 			.
// 	})
// });