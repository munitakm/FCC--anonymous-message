'use strict';
const url = require('url')
const mongoose = require('mongoose');
const {Schema} = require('mongoose');

module.exports = function (app) {
//Mongoose Schema and Model Database
	const repliesSchema = mongoose.Schema({
			"text": String,
			"delete_password": String,
			"board": String,
			"created_on": {type: Date, default: new Date().toUTCString()},
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

//Send POST request to/api/thread/{board}	

  app.post('/api/threads/:board', (req, res) => {
	console.log(req.body);
	const newThread = new Thread(req.body);
	  Thread.create(newThread, (err, saved) => {
		if( !err && saved )
		  return res.redirect(url.format({
		pathname: `/b/${req.body.board}`,
		query: newThread,
		}))
	})
	});
//POST to /api/replies/{board}
	app.post('/api/replies/:board', async (req, res) => {
		console.log(req.body);
		const find = await Thread.findById(req.body.thread_id)
		if(find) {
		console.log(req.body);
			const time = new Date().toUTCString();
			const newReplie = new Replies(req.body);
			newReplie.created_on = time
			Thread.findOneAndUpdate({
				_id: req.body.thread_id},
				{$push: {replies: newReplie}, $set: {bumped_on: time}},
				(err, res) => {
				if(err) console.log(err);
			})
	}
//GET request to /api/threads/{board}
		})
   
	app.get('/api/threads/:board', (req, res) => {
		Thread.find({board: req.params.board})
		.sort({bumped_on: 'desc'})
		.limit(10)
		.select(['-delete_password', '-reported'])
			.exec((err, list) => {
				list.forEach((thread) => {
					thread.replies.sort((target1, target2) => {
						return target2.created_on - target1.created_on;
					})
					thread.replies = thread.replies.slice(0, 3);
					thread.replies.forEach((target) => {
						target.reported = undefined;
						target.created_on = undefined
					})
				})
				res.json(list)
			})

	})
  
  app.route('/api/threads/:board')
		
  app.route('/api/replies/:board');

};
  
