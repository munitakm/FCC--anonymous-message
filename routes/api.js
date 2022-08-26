'use strict';
const mongoose = require('mongoose');


module.exports = function (app) {
  
  app.route('/api/threads/:board').
		post((req, res) => {
			console.log(req.body);
			//res.send({"message": "test"})
		})
    
  app.route('/api/replies/:board');

};
