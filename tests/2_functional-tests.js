const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
	test('POST request to /api/threads/{board}', (done) => {
		chai.request(server)
		.post('/api/threads/:board')
		.send({board: "teste", text: "teste", delete_password: "delete_me"})
			.end((err, res) => {
				assert.equal(res.status, 200),
				done();
			})
	})
});
