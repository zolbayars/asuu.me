'use strict'

var Users = require('../models/users.js');
var Answer = require('../models/answer.js');
var Question = require('../models/question.js');
var mongoose = require('mongoose');
var request =  require("request");
var ObjectId = mongoose.Schema.Types.ObjectId;

function QuestionController(myCache){

  this.addQuestion = function(req, res, next){

    console.log("addQuestion");
    console.log(req.query);
    console.log(req.params);

    var user = req.user;
    var userFBId = 'anonymous';
    if(user){
      userFBId: req.user.fb.id
    }

    var question = new Question({
      userId: userFBId,
      text: req.query['question']
    });

    question.save(function (err, question, numAffected) {
       if (err) { return next(err); }
       res.json(question);
     });
  }

// Get near and recommended watering holes from the Foursquare
  this.getQuestions = function(req, res){

    getQuestions(function(err, data){
      if(err){
        return res.json(err);
      }

      return res.json(buildSuccessRes(data));
    });

    function getQuestions(callback){
      Question
        .find({}, {}, function(err, goingsData){
            // console.log("goingsData");
            // console.log(goingsData);

            callback(err, goingsData);
        });
    }

  }

}


module.exports = QuestionController;
