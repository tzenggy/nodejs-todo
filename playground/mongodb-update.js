const {MongoClient, ObjectID} = require('mongodb');

console.log(new ObjectID());


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('Connected to MongoDB server');

	// db.collection('Todos').findOneAndUpdate({
	// 	_id: new ObjectID('5a7a1bafc0e73fc1525f0f52')
	// }, {
	// 	$set: {
	// 		completed: true
	// 	}
	// }, {
	// 	returnOriginal: false
	// }).then((result) => {console.log(result)});

	db.collection('Users').findOneAndUpdate({
		_id: new ObjectID('5a7a0f215aacfa2fe88e0481')
	}, {
		$set: {
			name: 'Emma'
		}, $inc: {
			age: 1
		}
	}, {
		returnOriginal: false
	}).then((result) => {console.log(result)});

	// db.close();
});