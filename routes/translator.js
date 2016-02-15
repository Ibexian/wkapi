var express = require('express');
var router = express.Router();
/* Add node to server to make it grab the new token */
var request = require('request');

var url = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13";
var post_data = {

};

/* GET users listing. */
router.get('/', function(req, res, next) {
	request.post(url, function(request, response) {
	    body = JSON.parse(response.body);
	    var jsonObj = body;
  		res.jsonp(jsonObj);
	}).form(post_data);
});

module.exports = router;
