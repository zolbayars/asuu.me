'use strict'

var path = process.cwd();
var QuestionController = require(process.cwd() + "/app/controllers/questionController.server.js");

module.exports = function(app, passport, myCache){

  var questionController = new QuestionController(myCache);

  function isLoggedIn(req, res, next){

    if(req.isAuthenticated()){
      console.log("Authenticated");
      return next(); //pass control to the next handler in middleware
    }else{
      console.log("Not Authenticated");
      res.redirect('/login');
    }
  }

  function isLoggedInAjax(req, res, next){

    if(req.isAuthenticated()){
      console.log("Authenticated");
      return next(); //pass control to the next handler in middleware
    }else{
      console.log("Not Authenticated");
      res.json({
        result_code: 800,
        result_msg: "You should login",
        result_redirect_url: '/login'
      });
    }
  }

  app.route('/')
    .get(function(req, res){

      var user = null;
      if(req.user){
        user = req.user.fb;
      }

      res.render("home", {title: 'asuu.me - Where you can find the answers',user: user});
    });

  // app.route('/questions/:id')
  //   .get(questionController.getPlaceImage);

  app.route('/questions/:id')
    .get(function(req, res){
      res.render("question-detail", {title: 'Question'});
    });



  app.route('/login')
    .get(function(req, res){
      res.render('login');
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
  // app.route('/places')
  //   .post(placeController.getNearPlaces);
  //
  // app.route('/places/photo/:id')
  //   .get(placeController.getPlaceImage);
  //
  // app.route('/places/going/:id')
  //   .post(isLoggedInAjax, placeController.addGoing)
  //   .delete(isLoggedInAjax, placeController.removeGoing);
}
