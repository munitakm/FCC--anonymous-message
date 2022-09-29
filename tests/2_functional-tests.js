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

suite('Functional Tests', async function() {
	await suite('posting 3 threads', () => {
	test('POST request to /api/threads/{board}', (done) => {
		chai.request(server)
		.post('/api/threads/general')
		.send({board: "general", text: "teste1", delete_password: "delete_me"})
		.end((err, res) => {
			console.log(res.body);
			assert.equal(res.status, 200);
			})

		chai.request(server)
		.post('/api/threads/general')
		.send({board: "general", text: "teste2", delete_password: "delete_me"})
		.end((err, res) => {
			assert.equal(res.status, 200);
			})
		chai.request(server)
			.post('/api/threads/general')
			.send({board: "general", text: "teste3", delete_password: "delete_me"})
			.end((err, res) => {
			assert.equal(res.status, 200);
			})
			done();
		})
	});
	test('Viewing the 10 most recent threads with 3 replies', (done) => {
		let path = "general";
		chai.request(server)
		.get('/api/threads/' + path)
		.end((err, res) => {
			console.log(res.body)
			toPost = res.body[0];
			toReport = res.body[1];
			toDelete = res.body[2];

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
		.delete('/api/threads/gengeral')
		.send({board: "general", thread_id: toDelete._id, delete_password: "wrong"})
		.end((err, res) => {
			assert.equal(res.status, 200),
			assert.equal(res.text, "incorrect password"),
			done()

		})
	});
	test('Delete thread with correct password', (done) => {
		chai.request(server)
		.delete('/api/threads/general')
		.send({thread_id: toDelete._id, delete_password: "delete_me"})
		.end((err, res) => {
			assert.equal(res.status, 200),
			assert.equal(res.text, "success"),
			done()

		})
	});	
	test('Reporting a thread with PUT', (done) => {
		chai.request(server)
		.put('/api/threads/general')
		.send({report_id: toReport._id})
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
			board: "general",
			text: "reply test",
			thread_id: toPost._id,
			delete_password: "reply_test"
		})
			.end((err, res) => {
				assert.equal(res.status, 200),
				assert.typeOf(res.body, "object"),
				done();
			})
	})
	test('Viewing a single thread with all replies with GET request', (done) => {
		chai.request(server)
		.get('/api/replies/general?thread_id=' + toPost._id)
		.end((err, res) =>{
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
			thread_id: toPost._id,
			reply_id: toPost.replies[0]._id,
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
			thread_id: toPost._id,
			reply_id: toPost.replies[0]._id,
			delete_password: "delete_me"})
			.end((err, res) => {
				console.log(res.text, 78);
				assert.equal(res.status, 200),
				assert.equal(res.text, "success"),
				done()
			})
	})
});
