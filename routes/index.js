var auth = require('../auth');
var app = require('../app');

exports.view = function(req, res) {
	res.render('index');
 }

exports.fbintro = function(req, res) {
    res.render('fbintro');
 }

 exports.twitintro = function(req, res) {
    res.render('twitintro');
 }


exports.fbpage = function(req, res) {
    //test api call facebook
    app.graph.get("/me?fields=feed", function(err, reply) {
      var tempArray = [];
      var storyArray = reply.feed.data;
      // console.log(storyArray[0].story);
      // console.log(JSON.stringify(res,  null, '\t')); // get my information as json
      // tempdata = JSON.stringify(res,  null, '\t');
      storyArray.map(function(item){
        var tempJSON = {}
        tempJSON.story = item.story;
        if(tempJSON.story !== undefined){
        console.log(tempJSON.story);
        tempArray.push(tempJSON);
    }
      });

      var data = {stories : tempArray};
      res.render('fbpage', data);
    });
}

exports.twitpage = function(req, res) {

	var finalData,
		screen_name,
		posts;

	//  get username of current user
    app.T.get('account/verify_credentials', function(err, reply) {
    	screen_name = reply.screen_name;
        // screen_name = "test";
    	complete();
    });

    //  get user twitter feed test
    app.T.get('statuses/user_timeline', { count: 100 }, function(err, reply) {

        var textArr = [];
        reply.map(function(item){
            var textJSON = {};
            textJSON.text = item.text;
            textJSON.time = parseTwitterDate(item.created_at);
            textArr.push(textJSON);
        });

        posts = textArr;
        complete();
    });

    // used to transform twitter's timestamp into something more readable
    function parseTwitterDate(tdate) {
		var system_date = new Date(Date.parse(tdate));
		var user_date = new Date();
		var diff = Math.floor((user_date - system_date) / 1000);
		if (diff <= 1) {return "just now";}
		if (diff < 20) {return diff + " seconds ago";}
		if (diff < 40) {return "half a minute ago";}
		if (diff < 60) {return "less than a minute ago";}
		if (diff <= 90) {return "one minute ago";}
		if (diff <= 3540) {return Math.round(diff / 60) + " minutes ago";}
		if (diff <= 5400) {return "1 hour ago";}
		if (diff <= 86400) {return Math.round(diff / 3600) + " hours ago";}
		if (diff <= 129600) {return "1 day ago";}
		if (diff < 604800) {return Math.round(diff / 86400) + " days ago";}
		if (diff <= 777600) {return "1 week ago";}
		return "on " + system_date;
	}

    // check to make sure that async calls are made before final render
    function complete() {
    	if(screen_name !== undefined && posts !== undefined) {
    		finalData = {'posts': posts, 'screen_name': screen_name};
    		res.render('twitpage', finalData);
    	}
    }
}

exports.twitterd3 = function(req, res) {
    //  get user twitter feed test
    var dataArr = [];
    app.T.get('statuses/user_timeline', { count: 100 }, function(err, reply) {

        reply.map(function(item){
            var tmpJSON = {};
            tmpJSON.text = item.text;
            tmpJSON.time = item.created_at;
            dataArr.push(tmpJSON);
        });
        res.json(dataArr);
    });


}

