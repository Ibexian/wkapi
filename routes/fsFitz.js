var express = require('express');
var router = express.Router();
var path = require('path');
var FeedParser = require('feedparser'),
    request = require('request');
var util = require('util');
var fs = require('fs');
var markov = require('markov');
var Twit = require('twit');
var Util = require('../util');

// var T = new Twit({

// });

// var twitterPost = function(text) {
//                 T.post('statuses/update', { status: text }, function(err, data, response) {
//                   console.log("data", data.id);
//                   console.log("text", text);
// 	});
// };

var logger = function(text){
    console.log(text);
}

/* GET text to translate */
router.use('/', function(req, res, next) {
	var feedparser = new FeedParser(),
    responses = [];
	request
		.get('http://www.reddit.com/r/javascript/top.xml')
		.on('error', function (error) {
		  	console.log(error);
		  	next();
		    fs.appendFile('log.txt', "Request Error " + error + " " + new Date(), function (err) {});
		    return;
	  	})
		.on('response', function (iniResponse) {
		    var stream = this;

		    if (iniResponse.statusCode != 200) {
		  		console.log(iniResponse.statusCode);
		    	res.send(iniResponse.statusCode)
		    	next();
		    	return this.emit('error', new Error('Bad status code'));
		    }

		    stream.pipe(feedparser);
	  	});


	  feedparser.on('error', function(error) {
	  	console.log(error);
	  	next();
	    fs.appendFile('log.txt', "FeedParser Error " + error + " "+ new Date(), function (err) {});
	    return
	  });

	  feedparser.on('readable', function() {
	    var stream = this,
	        meta = this.meta,
	        item;

	    while (item = stream.read()) {
	      responses.push(item.title);
	    }


	  });
	  //Once we've looked at all the recent titles pick a random one and markov translate it
	  feedparser.on('end', function(){
	      var num = Math.floor(Math.random() * (responses.length));
	      Util.markovTranslate(responses[num].toString(), 'fsFitz', logger); //passing in the cb to tweet the response
	      console.log(responses[num].toString());
	      res.json({response:responses[num].toString()})
	  });
});

router.get('/', function (req, res, next) {
  res.json({response:'Tweet Tweet'});
});

module.exports = router;
