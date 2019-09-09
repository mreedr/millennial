module.exports = function(){
	var bcrypt = require('bcrypt'),
		SALT_WORK_FACTOR = 10,
		mongoose = require('mongoose');

	// Connect to Mongo
	var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/millennial1';
	mongoose.connect(uristring, function (err, res) {
		if (err) {
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
		} else {
			console.log ('Succeeded connected to: ' + uristring);
		}
	});
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function () {
		console.log("connected to db");
	});

	var userSchema = mongoose.Schema({
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true},
	});

	var articleSchema = mongoose.Schema({
		title: { type: String, required: true, unique: true },
		slug: { type: String, required: true, unique: true },
		upvotes: { type: Number },
		downvotes: {type: Number }
	});

	userSchema.pre('save', function(next) {
		var user = this;

		if(!user.isModified('password')) return next();

		bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
			if(err) return next(err);

			bcrypt.hash(user.password, salt, function(err, hash) {
				if(err) return next(err);
				user.password = hash;
				next();
			});
		});
	});

	userSchema.methods.comparePassword = function(candidatePassword, cb) {
		bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
			if(err) return cb(err);
			cb(null, isMatch);
		});
	};

	User = mongoose.model('User', userSchema);
	Article = mongoose.model('Article', articleSchema);

	return {
		// PUBLIC FUNCTIONS
		saveUser: function( req, res ){
			var userObj = req.body;
			var newUser = new User(userObj);
			newUser.save(function(err, newUser){
				if(err) {
					console.log(err);
					res.send('{err: "Username already taken"}');
					return err;
				}
				console.log("new user: " + newUser.username);
				res.send('{err: "", msg: "' + newUser.username +' has been added successfully."}');
			});
		},

		getArticle: function( slug , callback ){
			Article.findOne({ slug: slug }, function(err, article) {
				if(err) {
					console.log(err);
					callback(err, null);
					return;
				} else if(article === undefined || article === null) {
					err = "Article not found";
					console.log(err);
					callback(err);
					return;
				}
				callback(null, article);
			});
		},

		saveArticle: function(req, res, articleObj ){
			var newArticle = new Article(articleObj);
			newArticle.save(function(err, newArticle){
				if(err) {
					console.log(err);
					res.send('{err: "Article title already taken"}');
					return err;
				}
				console.log("new article title: " + newArticle.title);
				console.log("new article url: " + newArticle.url);
				res.send('{err: "", msg: "' + newArticle.title +' has been added successfully."}');
			});
		}
	};
}();
