const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


// // we need a dummy array of todos for testing GET /todos because we assume the database isn't empty
// const todos = [{
// 	// adding _ad and ObjectID constructor make the id available
// 	_id: new ObjectID(),
// 	text: 'Postman task1'
// }, {
// 	_id: new ObjectID(),
// 	text: 'Postman task2',
// 	completed: true,
// 	completedAt: 123
// }, {
// 	_id: new ObjectID(),
// 	text: 'Postman task3'
// }, {
// 	_id: new ObjectID(),
// 	text: 'Postman task4',
// 	completed: true,
// 	completedAt: 3333
// }];


beforeEach(populateUsers);
// beforeeach() takes a function which has done as its argument
// beforeeach is called before each test is run
	// can be used to setup test database
beforeEach(/*(done) => {
	// this removes the collection to ensure the tests after can work properly
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);	
	}).then(() => done());
}*/
populateTodos);

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

describe('DELETE /todos/:id', () => {
	// it('should return deleted doc', (done) => {
	// we need to check that this returns a doc and also verify that this doc is removed from the database
	it('should remove a todo', (done) => {
		var hexId = todos[2]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[2].text);
			})
			// end wraps up this test and can receive a callback function as argument
				// takes error and res as arguments
			// define what to do after the test above is over
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				// findById return success even if the id cannot be found in the collection as long as it's a valid id
				Todo.findById(hexId).then((doc) => {
					expect(doc).toBeFalsy();
					done();
				}).catch((e) => {done(e)});
			});
	});

	it('should return 404 if todo not found', (done) => {
		var hexId = new ObjectID().toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 if object id invalid', (done) => {
		request(app)
			.delete('/todos/123123')
			.expect(404)
			.end(done);
	});

});

describe('PATCH /todos/:id', () => {
	it('should update the todo', (done) => {
		var hexId = todos[2]._id.toHexString();
		request(app)
			.patch(`/todos/${hexId}`)
			.send({completed: true})
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.completed).toBe(true);
				expect(res.body.todo.completedAt).toBeTruthy();
			})
			.end(done);
	});

	it('should clear completedAt when todo is not completed', (done) => {
		var hexId = todos[1]._id.toHexString();
		request(app)
			.patch(`/todos/${hexId}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completedAt).toBeFalsy();
			})
			.end(done);
	});
});

describe('GET /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect((res) => {
				// should be empty object
				expect(res.body).toEqual({});
			})
			.end(done);
	})
});

describe('POST /users', () => {
	it('should create a user', (done) => {
		var email = 'newemail@example.com';
		var password = 'newpass';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect((res) => {
				// use header to check if the user contain x-auth token
				// because x-auth has -, we need to use [] to access the object rather than .
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body.email).toBeTruthy();
				expect(res.body._id).toBeTruthy();
			})
			.end((err) => {
				if (err) {
					return done(err);
				}

				// Because this is a post request, we need to check more even we those three fields actually exist
				// Check by querying the database to see if the new user is actually created
				User.findOne({email}).then((user) => {
					expect(user).toBeTruthy();
					// new syntax documentation: https://facebook.github.io/jest/docs/en/expect.html#not
					expect(user.password).not.toBe(password);
					done();
				})
				.catch((err) => {done(err)})
			});
	});

	it('should return validation error if request invalid', (done) => {
		var email = 'abcabc';
		var password = 'ddd';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	});

	it('should not create user if email in use', (done) => {
		var email = users[0].email;
		var password = 'abcddddd';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	});
});

describe('POST /users/login', () => {
	it('should login user and return auth token', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password
			})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[1]._id.toHexString()).then((user) => {
					expect(user.tokens[0]).toHaveProperty('access', 'auth');
					expect(user.tokens[0]).toHaveProperty('token', res.headers['x-auth']);
					done();
				}).catch ((err) => done(err));

			})
	});

	it('should reject invalid login', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password + '1'
			})
			.expect(400)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeFalsy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[1]._id.toHexString()).then((user) => {
					expect(user.tokens.length).toBe(0);
					done();
				}).catch ((err) => done(err));

			})
	});
});