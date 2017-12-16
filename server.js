'use strict';

var express = require('express'),
  routes = require('./app/routers/index.js'),
  mongoose = require('mongoose'),
  passport = require('passport'),
	session = require('express-session'),
  expressValidator = require('express-validator'),
  bodyParser = require('body-parser'),
  path = require("path"),
  i18n = require("i18n");

i18n.configure({
    locales:['mn', 'en'],
    defaultLocale: 'mn',
    queryParameter: 'lang',
    directory: path.join(__dirname, "locales"),
    logDebugFn: function (msg) {
        console.log('debug', msg);
    },

    // setting of log level WARN - default to require('debug')('i18n:warn')
    logWarnFn: function (msg) {
        console.log('warn', msg);
    },

    // setting of log level ERROR - default to require('debug')('i18n:error')
    logErrorFn: function (msg) {
        console.log('error', msg);
    },
});

const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 600, checkperiod: 620 } );

var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(i18n.init);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(function(req, res, next) {
    // express helper for natively supported engines
    res.locals.__ = res.__ = function() {
        // res.setLocale('mn');
        return i18n.__.apply(req, arguments);
    };

    next();
});

mongoose.connect(process.env.MONGO_URI);

app.use("static", express.static(path.join(__dirname, "public")));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/node_modules', express.static(process.cwd() + '/node_modules'));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/common', express.static(process.cwd() + '/app/common'));



routes(app, passport, myCache);

var port = process.env.PORT || 8080;
app.listen(port, function () {
	console.log('Listening on port ' + port + '...');
});
