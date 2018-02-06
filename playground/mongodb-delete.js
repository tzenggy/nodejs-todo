const {MongoClient, ObjectID} = require('mongodb');

console.log(new ObjectID());


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('Connected to MongoDB server');


	// deleteMany
	// db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {console.log(result)}, (err) => {console.log(err)});

	// deleteOne
	// db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {console.log(result)})

	// fineOneAndDelete
	// db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {console.log(result)});


	// db.collection('Users').find({name: 'Zack'}).toArray().then((docs) => {console.log(JSON.stringify(docs, undefined, 2))}, (err) => {console.log(err)});

	// db.collection('Users').deleteMany({name: 'Zack'}).then((result) => console.log(result, undefined, 2));
	db.collection('Users').findOneAndDelete({_id: new ObjectID('5a7a10ac3901191b04a66f84')}).then((result) => {console.log(result)});

	// db.close();
});