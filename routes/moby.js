var express = require('express');
var router = express.Router();
var path = require('path');
var FeedParser = require('feedparser'),
    request = require('request');
var util = require('util');
var fs = require('fs');
var markov = require('markov');
var Twit = require('twit');

var T = new Twit({

});

var twitterPost = function(text) {
                T.post('statuses/update', { status: text }, function(err, data, response) {
                  console.log("data", data.id);
                  console.log("text", text);
	});
};

var tweetify = function(line) {
		var m = markov(2);
		var s = fs.createReadStream(path.join(__dirname, 'test.txt'));

        var mobyJson = fs.readFile(path.join(__dirname, 'moby.json'), function(err, data){
            if(err){
                console.log("building markov");
                m.seed(s, function(){
                    fs.writeFile(path.join(__dirname, 'moby.json'), m.writer());
                    stringSearch();
                });
            } else {
                console.log("reading markov");
                m.reader(data);
                stringSearch();
            }
        });

        function stringPretty(string) {
                var reg = new RegExp(/[,.?!\s]+/);
                var endNum =  reg.test(string.charAt(string.length-1));
                //Start with a capital, remove the final space, and add punctuation if there is none
            return string.charAt(0).toUpperCase() + string.slice(1, string.length) + (endNum ? "" : ".");
        };

        function stringSearch() {
        	console.log("It has begun");
                var items = line.toString().split(' ');
                var results = [];

                for(i=0; i<items.length; i++){
                        var search = m.search(items[i]);

                        if (search) {
                                //move backward from each word in the title predicting the word before it
                                var back = m.backward(search).join(' ');
                                if (back.length !== 0 ) {
                                        var tempItem = items[i];
                                        for (j=i + 1; j<items.length; j++){
                                                tempItem = tempItem + " " + items[j];
                                        }
                                        //Add the result and the remainder of the title to the result array
                                        var resultText = stringPretty((back + " " + tempItem).split(/\r?\n|\r/).join(' '));
                                        if (resultText.length <= 140) {
                                                results.push(resultText);
                                        }
                                }
                            }
                            if (i === items.length -1) {
                                //return random result from array
                                var num = Math.floor(Math.random() * (results.length));
                                if (results[num] == undefined || results[num] == "undefined") {
                                	console.log("Nothing to see here");
                                    return
                                } else {
                                        twitterPost(results[num]);
                                        console.log(results[num]);
                                }
                            }
                };

        };

		s.on('error', function(err) {
			console.log("there has been an error");
		    return
		});
}
/* GET Moby */
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
	  //Once we've looked at all the recent titles pick a random one and tweetify it
	  feedparser.on('end', function(){
	      var num = Math.floor(Math.random() * (responses.length));
	      tweetify(responses[num].toString());
	      console.log(responses[num].toString());
	      res.json({response:responses[num].toString()})
	  });
});

router.get('/', function (req, res, next) {
  res.json({response:'Tweet Tweet'});
});

module.exports = router;
