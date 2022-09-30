const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
const Thread = require('../models/thread');
const Replie = require('../models/thread');
const bcrypt = require('bcryptjs')

chai.use(chaiHttp);

// Tests 

var toPost = "";
var toDelete = "";
var toReport = "";
var toReply = "";

suite('Functional Tests', async function() {
	await suite('posting 3 threads', () => {
	test('POST request to /api/threads/{board}', (done) => {
		chai.request(server)
		.post('/api/threads/general')
		.send({board: "general", text: "toPost", delete_password: "delete_me"})
		.end((err, res) => {
			console.log(res.body);
			assert.equal(res.status, 200);
			})
		chai.request(server)
		.post('/api/threads/general')
		.send({board: "general", text: "toDelete", delete_password: "delete_me"})
		.end((err, res) => {
			assert.equal(res.status, 200);
			})
		chai.request(server)
			.post('/api/threads/general')
			.send({board: "general", text: "toReport", delete_password: "delete_me"})
			.end((err, res) => {
			assert.equal(res.status, 200);
			})
			done();
		})
	});
	test('Viewing the 10 most recent threads with 3 replies', (done) => {
		let path = "general";
		chai.request(server)
		.get('/api/threads/general')
		.end((err, res) => {
			toPost = String(res.body[0]._id);
			toReport = String(res.body[1]._id);
			toDelete = String(res.body[2]._id);

			assert.equal(res.status, 200),
			assert.typeOf(res.body, "array"),
			assert.isBelow(res.body.length, 11),
			res.body.forEach(thread => {
				assert.typeOf(thread.replies, "array"),
				assert.isBelow(thread.replies.length, 4),
				assert.equal(thread.delete_password, undefined),
				assert.equal(thread.reported, undefined),
				thread.replies.forEach(replie => {
					assert.equal(replie.delete_password, undefined),
					assert.equal(replie.reported, undefined)
					})
				})
			done();
		})
	})
	test('Delete thread with incorrect password', (done) => {
		chai.request(server)
		.delete('/api/threads/general')
		.send({board: "general", thread_id: toDelete, delete_password: "wrong"})
		.end((err, res) => {
			assert.equal(res.status, 200),
			assert.equal(res.text, "incorrect password"),
			done()

		})
	});
	test('Delete thread with correct password', (done) => {
		chai.request(server)
		.delete('/api/threads/general')
		.send({thread_id: toDelete, delete_password: "delete_me"})
		.end((err, res) => {
			assert.equal(res.status, 200),
			assert.equal(res.text, "success"),
			done()

		})
	});	
	test('Reporting a thread with PUT', (done) => {
		chai.request(server)
		.put('/api/threads/general')
		.send({thread_id: toReport})
			.end((err, res) => {
				assert.equal(res.status, 200),
				assert.equal(res.text, "reported"),
				done();
			})
	})
	test('Creating a new reply with POST request', (done) => {
		chai.request(server)
		.post('/api/replies/general')
		.send({
			text: "reply test to delete",
			thread_id: toPost,
			delete_password: "delete_me"
		})
			.end((err, res) => {
				assert.equal(res.status, 200),
				assert.typeOf(res.body, "object"),
				done();	
			})
	})
	test('Viewing a single thread with all replies with GET request', (done) => {
		chai.request(server)
		.get('/api/replies/general?thread_id=' + toPost)
		.end((err, res) =>{
			toReply = res.body.replies[0]._id;
			assert.equal(res.status, 200),
			assert.typeOf(res.body, "object"),
			assert.equal(res.body.board, "general"),
			assert.typeOf(res.body.replies, "array")
			done();
		})
	})
	test('Deleting reply with incorrect password', (done) => {
		chai.request(server)
		.delete('/api/replies/general')
		.send({
			board: "general",
			thread_id: toPost,
			reply_id: toReply,
			delete_password: "wrong"
			})
			.end((err, res) => {
				assert.equal(res.status, 200),
				assert.equal(res.text, "incorrect password"),
				done()
			})
	})
	test('Deleting reply with correct password', (done) => {
		chai.request(server)
		.delete('/api/replies/general')
		.send({
			board: "general",
			thread_id: toPost,
			reply_id: toReply,
			delete_password: "delete_me"})
			.end((err, res) => {
				assert.equal(res.status, 200),
				assert.equal(res.text, "success"),
				done()
			})
	})
	test("Reportin a reply with PUT request", (done) => {
		chai.request(server)
		.put("/api/replies/board")
		.send({thread_id: toPost, reply_id: toReply})
		.end((err, res) => {
			assert.equal(res.status, 200),
			assert.equal(res.text, "reported"),
			done();

		})
	})
});
