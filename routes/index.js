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

exports.d3graph = function(req, res) {
    res.render('d3graph');
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
        if(item.story !== undefined){
            tempJSON.story = item.story;
        }
        tempJSON.message = item.message;
        tempArray.push(tempJSON);

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

exports.facebookd3 = function(req, res) {
    //empty graph object which will be passed as json
    var graph = {};
    //query to get all friends
    app.graph.get("/me/friends", function(err, reply) {
        var friends = reply.data.reduce(function(acc, x){
            acc[x.id] = x.name;
            return acc;
        }, {});

        //grab all the ids
        var fids = Object.keys(friends);

        //set up the nodes in graph object, with several nested fid + name objects
        graph.nodes = fids.map(function(fid){
            return{
                id: fid,
                name: friends[fid]
            }
        });


        //fql query 
        var query = "SELECT uid1, uid2 FROM friend WHERE uid1 IN (SELECT uid2 FROM friend WHERE uid1=me()) AND uid2 IN (SELECT uid2 FROM friend WHERE uid1=me())";

        //grab all the source and targets for the edges
        app.graph.fql(query, function(err, reply) {
          graph.edges = reply.data.map(function(rel){
            return {
                source: fids.indexOf(rel.uid1),
                target: fids.indexOf(rel.uid2)
            };
          });
          //when all data is grabbed pass graph object as json to front end js
          res.json(graph);
        });
    });
}

