var fs = require('fs');
var markov = require('markov');

module.exports = {
	//tweetify expects a line of text, a valid bot name, and the call back for the resulting text
	markovTranslate: function(line, botName, cb) {
		var m = markov(2);
		var s = fs.createReadStream(path.join(__dirname, botName +'/'+ botName + '.txt'));

        var setJson = fs.readFile(path.join(__dirname, botName +'/'+ botName + '.json'), function(err, data){
            if(err){
                console.log("building markov");
                m.seed(s, function(){
                    fs.writeFile(path.join(__dirname, botName +'/'+ botName + '.json'), m.writer());
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
                                    cb(results[num]);
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
}
