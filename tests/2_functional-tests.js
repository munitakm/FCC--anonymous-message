const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
const Thread = require('../models/thread');
chai.use(chaiHttp);

// Tests 

let testThread = "teste";
var tredy = "";
let deleteThread =  Thread.create({
			board: "teste",
			text: "teste1",
			created_on: new Date(),
			delete_password: "teste",
			bumped_on: new Date(),
			replies: [],
			reported: false
		});

suite('Functional Tests', function() {
	test('POST request to /api/threads/{board}', (done) => {
		chai.request(server)
		.post('/api/threads/' + testThread)
		.send({board: "teste", text: "teste1", delete_password: "delete_me"})
		.end((err, res) => {
			assert.equal(res.status, 200),
			done();
			})
	})
	test('Viewning the 10 most recent threads with 3 replies', (done) => {
		let path = "general";
		chai.request(server)
		.get('/api/threads/' + path)
		.end((err, res) => {
			tredy = res.body[0];
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
	test("Delete thread with incorrect password", (done) => {
		chai.request(server)
		.delete('/api/threads/teste')
		.send({board: "teste", thread_id: deleteThread._id, delete_password: "wrong"})
		.end((err, res) => {
			console.log(res);
			assert.equal(res.status, 200),
			assert.equal(res.text, "incorrect password"),
			done()

		})
	});

		
});
