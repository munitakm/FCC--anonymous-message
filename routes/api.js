'use strict';
const url = require('url')
const mongoose = require('mongoose');
const {Schema} = require('mongoose');

module.exports = function (app) {
	const repliesSchema = mongoose.Schema({
			"text": String,
			"delete_password": String,
			"board": String,
			"created_on": {type: Date, default: new Date().toUTCString()},
			"bumped_on": { type: Date, default: new Date().toUTCString()},
			"reported": {type: Boolean, default: false}
	});
	const Replies = mongoose.model("Replies", repliesSchema);

	const threadSchema = mongoose.Schema({
		"board": String,
		"text": String,
		"delete_password": String,
		"created_on": {type: Date, default: new Date().toUTCString()},
		"bumped_on": {type: Date, default: new Date().toUTCString()},
		"reported": {type: Boolean, default: false}, 
		"replies": [repliesSchema],
	});

	const Thread = mongoose.model("Thread", threadSchema);

  app.post('/api/threads/:board', (req, res) => {
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
	});

	app.post('/api/replies/:board', async (req, res) => {
		console.log(req.body);
		const find = await Thread.findById(req.body.thread_id)
		if(find){
		const newReplie = new Replies({
			text: req.body.text,
			board: req.body.board,
			delete_password: req.body.delete_password
		});
			Thread.findOneAndUpdate({_id: req.body.thread_id}, {$push: {replies: newReplie}}, (err, res) => {
				if(err) console.log(err);
			})
	}
	})
   
	app.get('/b/:board', (req, res) => {
		console.log(req.params.board)
	})
  
  app.route('/api/threads/:board')
		
  app.route('/api/replies/:board');

};
  
