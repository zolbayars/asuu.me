'use strict';

module.exports = {
	'fbAuth': {
		'appID': process.env.FACEBOOK_APP_ID,
		'appSecret': process.env.FACEBOOK_APP_SECRET,
		'callbackURL': process.env.APP_URL + 'auth/facebook/callback'
	}
};
