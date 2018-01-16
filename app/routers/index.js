'use strict'

var timeago = require("timeago.js");
const { check, body, query, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var path = process.cwd();
var QuestionController = require(process.cwd() + "/app/controllers/questionController.server.js");
var AnswerController = require(process.cwd() + "/app/controllers/answerController.server.js");
var ResultConstants = require(process.cwd() + "/app/config/result-constants.js");
var GeneralHelper = require(process.cwd() + "/app/helpers/generalHelper.js");

module.exports = function(app, passport, myCache){

  var questionController = new QuestionController(myCache);
  var answerController = new AnswerController(myCache);

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
        timeagoInstance: timeago(),
        result_code: 900
      }

      questionController.getQuestions(user, function(data){
        if(data){
          templateValues['questionsData'] = data;
          templateValues['result_code'] = 1000;
        }

        res.render("home", templateValues);
      });

    });

  app.route('/questions/:id/:slug')
    .get(function(req, res){

      var user = 'anonymous';
      if(req.user){
        user = req.user.fb;
      }

      var utils = new GeneralHelper();
      var localTimeAgo = utils.getTimeAgoMNLocale();
      timeago.register('mn', localTimeAgo);

      var templateValues = {
        user: user,
        timeagoInstance: timeago()
      }

      questionController.getQuestionByID(req.params.id, function(data){
        if(data){
          templateValues['questionData'] = data,
          templateValues['title'] = data.text + " - asuu.me"

          questionController.getRelatedQuestions(data.text, data._id, function(relatedQuestions){
            if(relatedQuestions){
              templateValues['relatedQuestions'] = relatedQuestions,
              res.render("question-detail", templateValues);
            }
          });
        }


      });

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

  app.route('/auth/facebook')
    .get(passport.authenticate('facebook'));

  app.route('/auth/facebook/callback')
  	.get(passport.authenticate('facebook', {
  		successRedirect: '/',
  		failureRedirect: '/login'
  	}));


  // app.route('/places/photo/:id')
  //   .get(placeController.getPlaceImage);
  //
  app.post('/answer/add', [
      check('question').exists(),
      check('text').exists()
    ], (req, res, next) => {

      try {
        validationResult(req).throw();

        var user = 'anonymous';
        if(req.user){
          user = req.user.fb;
        }

        var utils = new GeneralHelper();
        var localTimeAgo = utils.getTimeAgoMNLocale();
        timeago.register('mn', localTimeAgo);

        var templateValues = {
          user: user,
          timeagoInstance: timeago(),
          result_code: 900
        }

        answerController.addAnswer(user, req.body, function(result){
          if(result){
            templateValues = result;
            templateValues['timeagoInstance'] = timeago();
          }

          res.render("partials/answer-in-list", templateValues);
        });

      } catch (err) {
        console.error(err);
        res.status(400).json(ResultConstants[400]);
      }
    });

  app.post('/question/add', [
      check('question').exists()
    ], (req, res, next) => {

      try {
        validationResult(req).throw();

        var user = 'anonymous';
        if(req.user){
          user = req.user.fb;
        }

        var utils = new GeneralHelper();
        var localTimeAgo = utils.getTimeAgoMNLocale();
        timeago.register('mn', localTimeAgo);

        var templateValues = {
          user: user,
          timeagoInstance: timeago(),
          result_code: 900
        }

        questionController.addQuestion(user, req.body['question'], function(result){
          if(result){
            templateValues = result;
            templateValues['timeagoInstance'] = timeago();
          }

          res.render("partials/question-in-list", templateValues);
        });

      } catch (err) {
        console.error(err);
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

  app.get('/question/rate', [
      query('question-id').exists(),
      query('is-positive').exists()
    ], (req, res, next) => {
      if(req.isAuthenticated()){
        try {
          validationResult(req).throw();h
          questionController.addQuestion(req, res, next)
        } catch (err) {
          res.status(400).json(ResultConstants[400]);
        }
      }else{
        res.status(403).json(ResultConstants[403]);
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
