const {MongoClient, ObjectID} = require('mongodb');

console.log(new ObjectID());


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('Connected to MongoDB server');



	// db.collection('Todos').find({_id: new ObjectID('5a7a0d9c7476922fec567ba8')}).toArray().then((doc) => {
	// 	console.log(JSON.stringify(doc, undefined, 2));
	// }, (err) => {
	// 	console.log(err);
	// })

	// db.collection('Todos').find().count().then((count) => {
	// 	console.log(`Count: ${count}`);
	// }, (err) => {
	// 	console.log(err);
	// });

	db.collection('Users').find({name: 'Zack'}).toArray().then((docs) => {console.log(JSON.stringify(docs, undefined, 2))}, (err) => {console.log(err)});


	// db.close();
});