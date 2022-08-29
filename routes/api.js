'use strict';
const url = require('url')
const mongoose = require('mongoose');
const {Schema} = require('mongoose');

module.exports = function (app) {
	const repliesSchema = new Schema({
			"text": String,
			"delete_password": String,
			"created_on": {type: Date, default: Date()},
			"bumped_on": { type: Date, default: Date() },
			"reported": {type: Boolean, default: false}
	});

	const threadSchema = mongoose.Schema({
		"board": String,
		"text": String,
		"delete_password": String,
		"created_on": {type: Date, default: Date()},
		"bumped_on": {type: Date, default: Date()},
		"reported": {type: Boolean, default: false}, 
		"replies": [repliesSchema],
	});

	const Thread = mongoose.model("Thread", threadSchema);

	
  
  app.route('/api/threads/:board')
		.post((req, res) => {
			console.log(req.body);
			const newThread = new Thread({
				board: req.body.board,
				text: req.body.text,
				delete_password: req.body.delete_password,
				replies: []
			})
			Thread.create(newThread);
			res.redirect(url.format({
				pathname: `/b/${req.body.board}`,
				query: newThread,
			}))
		})
    
  app.route('/api/replies/:board');

};
  
