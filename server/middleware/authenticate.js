var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
	// different from res.header() where we set the header key-value pair, req.header() gets the header info so we only supply the key name
	var token = req.header('x-auth');

	// This model method will find the appropriate user based on the token info in the request header
	// check that the token is correct
	User.findByToken(token).then((user) => {
		// We want to call res.status(401).send() but since this line already exists in the catch block, we can reject here and let catch block catch it
		if (!user) {
			return Promise.reject();
		}
		// // rather than sending the user back, we want to update body of the request
		// res.send(user);
		req.user = user;
		req.token = token;
		next();
	})
	.catch((e) => {
		// 401 means authentication didn't succeed
		res.status(401).send();
	});
}

module.exports = {authenticate};