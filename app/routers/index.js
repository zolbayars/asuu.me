'use strict'

var timeago = require("timeago.js");
const { check, body, query, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var path = process.cwd();
var QuestionController = require(process.cwd() + "/app/controllers/questionController.server.js");
var ResultConstants = require(process.cwd() + "/app/config/result-constants.js");
var GeneralHelper = require(process.cwd() + "/app/helpers/generalHelper.js");

module.exports = function(app, passport, myCache){

  var questionController = new QuestionController(myCache);

  app.route('/')
    .get(function(req, res){

      var user = 'anonymous';
      if(req.user){
        user = req.user.fb;
      }

      var utils = new GeneralHelper();
      var localTimeAgo = utils.getTimeAgoMNLocale();
      // console.log(localTimeAgo);

      timeago.register('mn', localTimeAgo);

      var templateValues = {
        title: 'asuu.me - Where you can find the answers',
        user: user,
        timeagoInstance: timeago()
      }

      questionController.getQuestions(user, function(data){
        if(data){
          templateValues['questionsData'] = data;
        }

        res.render("home", templateValues);
      })

    });

  app.route('/questions/:id')
    .get(function(req, res){

      var user = 'anonymous';
      if(req.user){
        user = req.user.fb;
      }

      var templateValues = {
        user: user
      }

      questionController.getQuestionByID(req.params.id, function(data){
        if(data){
          templateValues['questionData'] = data,
          templateValues['title'] = data.text
        }

        res.render("question-detail", templateValues);
      })

    });

  app.route('/user/:id')
    .get(function(req, res){
      res.render("user", {title: 'User'});
    });

  app.route('/login')
    .get(function(req, res){
      res.render('login',  {title: 'Login'});
    });

  app.route('/logout')
    .get(function(req, res){
      req.logout();
      res.redirect('/');
    });

  // app.route('/auth/facebook')
  //   .get(passport.authenticate('facebook'));
  //
  // app.route('/auth/facebook/callback')
  // 	.get(passport.authenticate('facebook', {
  // 		successRedirect: '/',
  // 		failureRedirect: '/login'
  // 	}));
  //

  // app.route('/places/photo/:id')
  //   .get(placeController.getPlaceImage);
  //

  app.post('/question/add', [
      check('question').exists()
    ], (req, res, next) => {
      try {
        validationResult(req).throw();
        questionController.addQuestion(req, res, next)
      } catch (err) {
        res.status(400).json(ResultConstants[400]);
      }
    });

  app.get('/question', [
      query('question').exists()
    ], (req, res, next) => {
      try {
        validationResult(req).throw();
        questionController.addQuestion(req, res, next)
      } catch (err) {
        res.status(400).json(ResultConstants[400]);
      }
    });

  function isLoggedIn(req, res, next){

    if(req.isAuthenticated()){
      console.log("Authenticated");
      return next(); //pass control to the next handler in middleware
    }else{
      console.log("Not Authenticated");
      res.redirect('/login');
    }
  }
}
