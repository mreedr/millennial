
/**
 * Module dependencies.
 */
var express = require('express'),
	app = express(),
	http = require('http'),
	path = require('path'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10,
	mongoose = require('mongoose'),
	db = require('./model/db'),
	auth = require('./model/auth')(passport, LocalStrategy),
	engine = require('ejs-locals');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: "crumbs"}));
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', function(req, res){
	res.render('index');
});

app.get('/article/:id', function(req, res) {
	var id = req.params.id;
	console.log(id);
	db.getArticle(id, function(err, article){
		if(err){
			console.log(err);
			res.render('404');
			return;
		}
		res.render('article', {article: article});
	});
});

app.get('/add', auth.ensureAuthenticated, function(req, res){
	res.render('add');
});
app.post('/add', auth.ensureAuthenticated, function(req, res){
	req.body.upvotes = 0;
	req.body.downvotes = 0;
	db.saveArticle(req, res, req.body);
});

app.post('/upvote/:id', function(req, res){
	var slug = req.params.id;

	db.getArticle(slug, function(err, article){
		if(err){
			console.log(err);
			res.render('404');
			return;
		}
		article.upvotes = article.upvotes + 1;

		article.save(function(err, article){
			if(err) {
				console.log(err);
				res.send('{err: "Username already taken"}');
				return err;
			}
			res.render('article', {article: article});
		});

	});
});

app.post('/downvote/:id', function(req, res){
	var slug = req.params.id;

	db.getArticle(slug, function(err, article){
		if(err){
			console.log(err);
			res.render('404');
			return;
		}
		article.downvotes = article.downvotes + 1;

		article.save(function(err, article){
			if(err) {
				console.log(err);
				res.send('{err: "Not good"}');
				return err;
			}
			res.render('article', {article: article});
		});

	});
});


app.get('/signup', function(req, res){
	res.render('signup');
});
app.post('/signup', function(req, res){
	db.saveUser(req, res);
});

app.get('/login', function(req, res){
	res.render('login');
});
app.post('/login', auth.authenticate, function(req, res){
	console.log("made it");
});
app.get('logout', function(req, res){
	req.logout();
	res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
