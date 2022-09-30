const mongoose = require('mongoose');

//Mongoose Schema and Model Database
	const repliesSchema = mongoose.Schema({
			"text": String,
			"delete_password": String,
			"board": String,
			"created_on": {type: Date, default: new Date()},
			"reported": {type: Boolean, default: false}
	});
	
	
	module.export = mongoose.model("Replies", repliesSchema);
	
	const threadSchema = mongoose.Schema({
		"board": String,
		"text": String,
		"delete_password": {type: String},
		"created_on": {type: Date, default: new Date()},
		"bumped_on": {type: Date, default: new Date()},
		"reported": {type: Boolean, default: false}, 
		"replies": {type: [repliesSchema], default: []}
	});

	module.exports = mongoose.model("Thread", threadSchema);
