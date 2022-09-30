'use strict';
const url = require('url')
const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const bcrypt = require('bcryptjs');
const Thread = require('../models/thread');
const Replie = require('../models/thread');

module.exports = function (app) {

//Threads Route
  app.route('/api/threads/:board')
	//POST request
	.post(async(req, res, next) => {
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
				res.redirect(`/b/${board}`);
		}
		catch (err) {
				console.log(err)
				res.json({"message": "error"})
		}
	})
	//GET request
		.get(async (req, res) => {
			try {
				let board = req.body.board;
				if(!board) {
					board = req.params.board
				}
				await Thread.find({board: board})
				.sort({bumped_on: 'desc'})
				.limit(10)
				.lean()
					.exec((err, list, next) => {
						if(!err && list) {
							list.forEach(i => {
								i.replycount = i.replies.length;
							    i.delete_password = undefined;
								i.reported = undefined;
								i.replies.sort((a,b) => {
									return b.created_on - a.created_on;
								});
								i.replies = i.replies.slice(0,3);
								i.replies.sort((a, b) => {
									return a.created_on - b.created_on;
								});
								i.replies.forEach(j => {
									j.delete_password = undefined;
									j.reported = undefined;
								})
							});
							res.send(list);
						}
					});
			} catch (err) {
				res.json("not found")
			}
		})
	//DELETE request
		.delete(async (req, res, next) => {
			let id = req.body.thread_id;
			let pass = req.body.delete_password;

			if(!mongoose.Types.ObjectId.isValid(id)) {
				return res.send("incorrect password")
			}
			
			Thread.findOne({_id: id, board: req.params.board})
				.then((found) => {
					if(found) {
						bcrypt.compare(pass, found.delete_password)
							.then(login => {
								if(login == true) {
									found.remove();
									return res.send("success");
								}
								return res.send("incorrect password");
							})
					} else {
						return res.send("incorrect password")
					}
				})
		})
	//PUT request
		.put((req, res) => {
			if(!mongoose.Types.ObjectId.isValid(req.body.thread_id)) {
				return res.send("reported");
			}
			Thread.findById(req.body.thread_id)
			.then(report => {
				if(report) {
					report.reported = true;
					report.save();
			} 
		})
			return res.send("reported")
	})
			
//Replies Route	
  app.route('/api/replies/:board')
	//POST request
	.post(async(req,res) => {
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
						res.redirect(`/b/${board}/${thread_id}`)
					}
				})

			} catch(err) {
				console.log(err)
				res.json({ "message": "error post replie" })
			}
	
		})
	//GET request
		.get((req, res) => {
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
					return res.json(found)
				}
			})
		})
	//DELETE request
		.delete((req, res, next) => {
			if(!mongoose.Types.ObjectId.isValid(req.body.thread_id)
				|| !mongoose.Types.ObjectId.isValid(req.body.reply_id)) {
					res.send("incorrect password");
					next();
				}
			else {
				Thread.findById(req.body.thread_id)
					.then(thread => {
						if(thread) {
							let replie = thread.replies.id(req.body.reply_id);
							if(replie) {
								bcrypt.compare(
									req.body.delete_password,
									replie.delete_password)
									.then(login => {
										console.log(login)
										if(login == true) {
											replie.text = "[deleted]";
											thread.save();
											res.send("success");
											next();
										} else {
											res.send("incorrect password")
										}
									})
							} else {
								res.send("incorrect password")
							}
						} else {
							res.send("incorrect password")
						}
					})
				}
			})
	//PUT request
		.put(async (req, res) => {
			let thread = await Thread.findById(req.body.thread_id);
			for(let r of thread.replies) {
				if(r._id == req.body.reply_id) {
					r.reported = true;
					Thread.findByIdAndUpdate(req.body.thread_id, thread, (err, updated) => {
					})
					return res.send("reported")
				}
			}
		})
}
