'use strict'

var timeago = require("timeago.js");
const { check, body, query, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

var path = process.cwd();
var QuestionController = require(process.cwd() + "/app/controllers/questionController.server.js");
var AnswerController = require(process.cwd() + "/app/controllers/answerController.server.js");
var VoteController = require(process.cwd() + "/app/controllers/voteController.server.js");
var ResultConstants = require(process.cwd() + "/app/config/result-constants.js");
var GeneralHelper = require(process.cwd() + "/app/helpers/generalHelper.js");
var ErrorHandler = require(process.cwd() + "/app/helpers/errorHandler.js");
var Users = require('../models/users.js');

module.exports = function(app, passport, myCache){

  var questionController = new QuestionController(myCache);
  var answerController = new AnswerController(myCache);
  var voteController = new VoteController(myCache);
  let errorHandler = new ErrorHandler();

  const clientIdCacheKey = "client-id";
  const paginationSkip = 0;
  const paginationPerPage = 20; ;
  const paginationLimit = 20;

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

      let skip = paginationSkip;
      let limit = paginationLimit;
      let perPage = paginationPerPage;

      if(req.query['skip']){
        skip = parseInt(req.query['skip']);
      }

      if(req.query['limit']){
        limit = parseInt(req.query['limit']);
      }

      questionController.getQuestions(user, req.query['nav'], skip, limit, function(data){
        if(data){
          templateValues['questionsData'] = data;
          templateValues['result_code'] = 1000;
          templateValues['activeNav'] = req.query['nav'];
          templateValues['skip'] = skip;
          templateValues['limit'] = limit;
          templateValues['per_page'] = perPage;
          // console.log(data);
        }

        if(skip == 0){
          res.render("home", templateValues);
        }else if(data.length == 0){
          res.json(ResultConstants.NO_MORE_QUESTIONS);
        }else{
          res.render("partials/questions-list", templateValues);
        }
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

      questionController.getQuestionByID(req.params.id, user, function(data, voteData){
        if(data){
          templateValues['questionData'] = data,
          templateValues['isUserUpVoted'] = voteData.isUserUpVoted,
          templateValues['isUserDownVoted'] = voteData.isUserDownVoted,
          templateValues['answerVotes'] = voteData.answerVotes,
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

  app.get('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/users/' + user.username);
      });
    })(req, res, next);
  });

  app.route('/logout')
    .get(function(req, res){
      req.logout();
      res.redirect('/');
    });

  app.get('/auth/facebook/', function(req,res,next) {
    console.log("req.ip 1", req.ip);
    let cacheSuccess = myCache.set(clientIdCacheKey+'-redirect-'+req.ip, req.query['url']);
    console.log("cacheSuccess", cacheSuccess);

    passport.authenticate(
      'facebook',
       {callbackURL: '/auth/facebook/callback'}
    )(req,res,next);
  });

  app.get('/auth/facebook/callback/', function(req,res,next) {
    console.log("req.ip 2", req.ip);
    let redirectUrl = '/';
    try {
      let urlFromCache = myCache.get(clientIdCacheKey+'-redirect-'+req.ip);
      if(urlFromCache && urlFromCache != ' '){
        redirectUrl = urlFromCache;
      }
    } catch (e) {
      console.error("error in auth", e);
    }

    console.log("redirectUrl", redirectUrl);
    passport.authenticate('facebook', {
  		successRedirect: redirectUrl,
  		failureRedirect: '/login'
  	}) (req,res,next);
   });

  // app.get('/auth/facebook/callback/', function(req,res,next) {
  //   console.log("!!!!!! redirect url: ",req.query.url);
  //   passport.authenticate(
  //     'facebook',
  //      {
  //        callbackURL:"/auth/facebook/callback/?url="+req.query['url']
  //      , successRedirect:req.query.url
  //      , failureRedirect:"/login_failed.html"
  //      }
  //    ) (req,res,next);
  //  });

  // app.get('/auth/facebook/callback', function(req, res, next) {
  //   passport.authenticate('facebook', function(err, user, info) {
  //     if (err) { return next(err); }
  //     if (!user) { return res.redirect('/login'); }
  //     req.logIn(user, function(err) {
  //       if (err) { return next(err); }
  //       return res.redirect(req.query['redirect-url']);
  //     });
  //   })(req, res, next);
  // });

  // Add vote to question or answer
  app.post('/vote/add', [
      check('post-id').exists(),
      check('is-positive').exists(),
      check('post-type').exists(),
      check('user').custom(userValidator)
    ], async (req, res, next) => {

      try {
        validationResult(req).throw();

        console.group("/vote/add "+ req.realUser._id+"\n", req.body);

        let voteparams = {
          postId: req.body['post-id'],
          postType: req.body['post-type'],
          point: req.body['is-positive'] == 1 ? 1 : -1
        }

        let voteResult = await voteController.addVote(req.realUser, voteparams);

        console.log("/vote/add response"+ req.realUser._id+"\n", voteResult);
        console.groupEnd();

        return res.json(voteResult);

      } catch (err) {
        next(err);
      }

    });

  // Remove vote from question or answer
  app.post('/vote/remove', [
      check('post-id').exists(),
      check('post-type').exists(),
      check('vote-id').exists(),
      check('user').custom(userValidator)
    ], async (req, res, next) => {

      try {
        validationResult(req).throw();
        console.group("/vote/remove "+ req.realUser._id+"\n", req.body);

        let voteResult = await voteController.removeVote(req.body);

        console.log("/vote/remove response "+ req.realUser._id+"\n", voteResult);
        console.groupEnd();

        return res.json(voteResult);

      } catch (err) {
        next(err);
      }
    });


  // app.route('/places/photo/:id')
  //   .get(placeController.getPlaceImage);
  //
  app.post('/answer/add', [
      check('question-id').exists(),
      check('text').exists()
    ], async (req, res, next) => {

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

        let answerResult = await answerController.addAnswer(user, req.body);
        if(answerResult){
          templateValues = answerResult;
          templateValues['timeagoInstance'] = timeago();
          res.render("partials/answer-in-list", templateValues);
        }

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

  // API level errors are caught in here
  app.use((err, req, res, next) => {
    let error = errorHandler.handle(err);
    return res.json(error);
  });

  async function userValidator(value,  { req, location, path }){
    // console.log("inside custom validator");
    // console.log("value", value);
    // console.log("location", location);
    // console.log("user", req.user);
    // console.log("req", req.body);

    if(req.user != null && req.user != undefined){
      req.fbUser = req.user.fb;
      let realUser = null;

      try {
        realUser = await Users.findOne({ 'fb.id': req.user.fb.id }).exec();
        console.log("realUser", realUser);
        if(!realUser){
          throw new Error("COULD_NOT_FIND_USER_IN_DB");
        }
        req.realUser = realUser;

      } catch (e) {
        console.error("Error while checking user in userValidator\n",e);
        throw new Error("COULD_NOT_FIND_USER_IN_DB");
      }

    }else{
      throw new Error("NEED_TO_LOGIN");
    }

    // req.user = "Lkhagvaa";
    return true;
  };
}
