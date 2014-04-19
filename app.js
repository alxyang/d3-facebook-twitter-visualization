//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var graph = require('fbgraph');
var passport = require('passport');
var util = require('util');
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook-canvas');
var Twit = require('twit');
//load environment variables
var dotenv = require('dotenv');
dotenv.load();

var app = express();

//route files to load
var index = require('./routes/index');

//twitter api keys
var CONSUMER_KEY = process.env.twitter_consumer_key;
var CONSUMER_SECRET = process.env.twitter_consumer_secret;
var CALLBACK_URL_TWITTER = process.env.devurltwitter
var ACCESS_TOKEN = "";
var ACCESS_TOKEN_SECRET = "";

//facebook api keys
var FACEBOOK_APP_ID = process.env.facebook_client_id;
var FACEBOOK_APP_SECRET = process.env.facebook_client_secret;
var CALLBACK_URL_FACEBOOK = process.env.devurlfacebook;
var FB_ACCESS_TOKEN = "";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Twitter profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}
// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: CALLBACK_URL_FACEBOOK
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      console.log( accessToken);
      FB_ACCESS_TOKEN = accessToken;
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// Use the TwitterStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Twitter profile), and
//   invoke a callback with a user object.
passport.use(new TwitterStrategy({
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET,
    callbackURL: CALLBACK_URL_TWITTER
  },
  function(token, tokenSecret, profile, done) {
    // // asynchronous verification, for effect...
    process.nextTick(function () {
      console.log(token);
      ACCESS_TOKEN = token;
      ACCESS_TOKEN_SECRET = tokenSecret;
      // To keep the example simple, the user's Twitter profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Twitter account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


//database setup - uncomment to set up your database
//var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/DATABASE1);

//Configures the Template engine
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
//routes
app.get('/', index.view);
app.get('/fbintro', index.fbintro);
app.get('/twitintro', index.twitintro);
app.get('/fbpage', ensureAuthenticated, index.fbpage);
// app.get('/fbpagecanvas', index.fbpagecanvas);
app.get('/twitpage', ensureAuthenticated, index.twitpage);

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook-canvas', { scope: ['email, user_about_me, user_birthday, user_location,read_stream, user_likes, user_photos, user_relationships, user_status, user_work_history'] }),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook-canvas', { failureRedirect: '/' }),
  function(req, res) {
        graph.setAccessToken(FB_ACCESS_TOKEN);
        // code is set
    // we'll send that and get the access token
        exports.graph = graph;
        res.redirect('/fbpage');

  });

//Facebook Canvas
app.post('/', function( req, res ){
    res.redirect(307, '/auth/facebook/canvas');
});
app.post('/auth/facebook/canvas', 
  passport.authenticate('facebook-canvas', { failureRedirect: '/auth/facebook/canvas/autologin' }),
  function(req, res) {

        graph.setAccessToken(FB_ACCESS_TOKEN);
        exports.graph = graph;
        res.redirect('/fbpage');

  });

app.get('/auth/facebook/canvas/autologin', function( req, res ){
  res.send( '<!DOCTYPE html>' +
              '<body>' +
                '<script type="text/javascript">' +
                  'top.location.href = "/auth/facebook";' +
                '</script>' +
              '</body>' +
            '</html>' );
});

// GET /auth/twitter
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Twitter authentication will involve redirecting
//   the user to twitter.com.  After authorization, the Twitter will redirect
//   the user back to this application at /auth/twitter/callback
app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
  });

// GET /auth/twitter/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    var T = new Twit({
    consumer_key:         CONSUMER_KEY
  , consumer_secret:      CONSUMER_SECRET
  , access_token:         ACCESS_TOKEN
  , access_token_secret:  ACCESS_TOKEN_SECRET
  })
    exports.T = T;
    res.redirect('/twitpage');
  });



//set environment ports and start application
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});