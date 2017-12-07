'use strict';

var FBStrategy = require('passport-facebook').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

  passport.use(new FBStrategy({
		clientID: configAuth.fbAuth.appID,
		clientSecret: configAuth.fbAuth.appSecret,
		callbackURL: configAuth.fbAuth.callbackURL,
    profileFields: ['id', 'displayName', 'email', 'cover', 'picture', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
	},
  function (accessToken, refreshToken, profile, cb) {
		process.nextTick(function () {
			User.findOne({ 'fb.id': profile.id }, function (err, user) {
				if (err) {
					return cb(err);
				}

				if (user) {
					return cb(null, user);
				}else{
          console.log("FB user:");
          console.log(profile);

          var newUser = new User();

					newUser.fb.id = profile.id;
					newUser.fb.email = profile.email;
					newUser.fb.displayName = profile.displayName;

					newUser.save(function (err) {
						if (err) {
							throw err;
						}

						return cb(null, newUser);
					});
        }
			});
		});
	}));

};
