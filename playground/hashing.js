const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

//	salt helps generate random text after password and hash that instead
// genSalt takes 2 arguments, number of times to run this algo and callback function
bcrypt.genSalt(10, (err, salt) => {
	bcrypt.hash(password, salt, (err, hash) => {
		// console.log(hash);
	})
})

var hashedPassword = '$2a$10$VUt7QcmGwos4Gb5WIspBEe.3MuI0RHwxiyRdhpx8.EzuqvgQCblzG';

// res === true if compared to be same
bcrypt.compare('123abc', hashedPassword, (err, res) => {
	console.log(res);
})

// jsonwebtoken module has two main functions, create token and verify token
	// we don't need a long list of if else statements anymore
	// jwt.sign
		// jwt.sign takes two arguments, one is the data object, the other is the secret
		// we can go to jwt.io to check what's contained in the token	
			// iat is the issued at timestamp
	// jwt.verify
		// jwt.verify takes 2 arguments as well, the token and the same secret string as jwt.sign
		// if either the token or the secret string is changed, jwt.verify will return an error


// var data = {
// 	id: 10
// };

// var data2 = {
// 	id: 5
// }

// var token1 = jwt.sign(data, '123abc');

// var token2 = jwt.sign(data2, 'secret2');

// var decoded = jwt.verify(token1, '123abc');

// var decoded2 = jwt.verify(token2, 'secret2');

// console.log('decoded', decoded);
// console.log('decoded2', decoded2);

// var message = 'Wahahaha I am';
// // SHA256 returns an object, so we use toString to convert it to a string
// var hash = SHA256(message).toString();

// console.log(`message: ${message}`);
// console.log(`hash: ${hash}`);

// var data = {
// 	id: 4
// };

// var token = {
// 	data,
// 	// this is the hash of data, used to verify the data is authenticated
// 	hash: SHA256(JSON.stringify(data) + 'Some secret').toString()
// };

// token.data = {id: 5, hash: SHA256(JSON.stringify(data)).toString()};

// var resultHash = SHA256(JSON.stringify(token.data) + 'Some secret').toString();

// if (resultHash === token.hash) {
// 	console.log('Data was not changed');
// } else {
// 	console.log('Data was changed');
// }