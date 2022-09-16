'use strict';
const url = require('url')
const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const bcrypt = require('bcryptjs');

module.exports = function (app) {
//Mongoose Schema and Model Database
	const repliesSchema = mongoose.Schema({
			"text": String,
			"delete_password": String,
			"board": String,
			"created_on": {type: Date},
			"reported": {type: Boolean, default: false}
	});
	const Replie = mongoose.model("Replies", repliesSchema);

	const threadSchema = mongoose.Schema({
		"board": String,
		"text": String,
		"delete_password": {type: String},
		"created_on": {type: Date},
		"bumped_on": {type: Date},
		"reported": {type: Boolean, default: false}, 
		"replies": [],
	});

	const Thread = mongoose.model("Thread", threadSchema);
//--------------------------------------

//Threads Route
  app.route('/api/threads/:board')
	//POST request
	.post(async(req, res) => {
		try {
			let board = req.params.board;

			let newThread = await Thread.create({
				board: board,
				text: req.body.text,
				created_on: new Date().toUTCString(),
				bumped_on: new Date().toUTCString(),
				delete_password: await bcrypt.hash(req.body.delete_password, 8),
				reported: false,
				replies: []
			});
				return res.redirect(`/b/${board}`)
		}
		catch (err) {
				console.log(err)
				return res.json({"message": "error"})
		}
	})
	//GET request
		.get(async (req, res) => {
			try {
				let board = req.params.board;
				await Thread.find({board: board})
				.sort({bumped_on: 'desc'})
				.limit(10)
				.lean()
					.exec((err, list) => {
						if(!err && list) {
							delete list.delete_password;
							delete list.reported;
							list.forEach(i => {
								i.replycount = i.replies.length;

								i.replies.sort((a,b) => {
									return b.created_on - a.created_on;
								});
								i.replies = i.replies.slice(0,3);
								i.replies.sort((a, b) => {
									return a.created_on - b.created_on;
								})
								delete i.delete_password;
								delete i.reported;
							});
							return res.json(list);
						}
					});
			} catch (err) {
				return res.json({"message": "error get threads"})
			}
		})
	//DELETE request
		.delete(async (req, res) => {
			let id = req.body.thread_id;
			let pass = req.body.delete_password;
			let found = await Thread.findOne({_id: id, board: req.body.board})
			if(found) {
				await bcrypt.compare(pass, found.delete_password, (err, correct) => {
					if(err) {
						res.send("incorrect password")
					} else{
						Thread.findByIdAndRemove(id, (err, deleted) => {
							res.send("success")
						});
					}
				})
			} else {
				res.send("incorrect password")
			}	
		})
//Replies Route	
  app.route('/api/replies/:board')
	//POST request
	.post(async(req,res) => {
		console.log(req.body, req.params);
		try {
			let board = req.params.board;
			let {text, delete_password, thread_id} = req.body;
			let newReplie = new Replie({
				text: text,
				created_on: new Date(),
				reported: false,
				delete_password: await bcrypt.hash(delete_password, 8)
			});
			await Thread.findOne({_id: thread_id, board: board})
				.exec(async (err, thread) => {
					if(!err && thread) {
						thread.replies.push(newReplie);
						thread.bumped_on = newReplie.created_on;
						await thread.save();
						console.log("saved replie");
						res.redirect(`/b/${board}/${thread_id}`)
					}
				});

			} catch(err) {
				console.log(err)
				res.json({ "message": "error post replie" })
			}
	
		})
	//GET request
		.get((req, res) => {
		console.log(req.query, req.params);
			Thread.findById(req.query.thread_id)
				.lean()
				.exec((err, found) => {
				if(!err && found) {
					found.delete_password = undefined;
					found.reported = undefined;
					found.replies.forEach(i => {
						i.delete_password = undefined;
						i.reported = undefined;
					});
					console.log(found)
					return res.json(found)
				}
			})
		})
	//DELETE request
		.delete(async(req, res, next) => {
			try {
			let thread = await Thread.findOne({_id: req.body.thread_id, board: req.body.board})
				for(let r of thread.replies) {
					let testPass = await bcrypt.compare(req.body.delete_password, r.delete_password);
					if(testPass == true && req.body.reply_id == r._id) {
						r.text = "[deleted]";
						Thread.update({_id: req.body.thread_id}, thread, (err, saved) => {
							console.log(saved, "modificado")
						})
						return res.send("success")
					}
				}
				console.log(found)
				return res.send("incorrect password");
				
			} catch (err) {
				return res.send("incorrect password");
			}	
		})
}
