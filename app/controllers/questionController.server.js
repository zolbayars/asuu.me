'use strict'

var mongoose = require('mongoose');
var request =  require("request");

var Users = require('../models/users.js');
var Answer = require('../models/answer.js');
var Question = require('../models/question.js');
var GeneralHelper = require("../helpers/generalHelper.js");

var ObjectId = mongoose.Schema.Types.ObjectId;

function QuestionController(myCache){

  var utils = new GeneralHelper();

  this.addQuestion = function(req, res, next){

    var user = req.user;
    var userFBId = 'anonymous';
    if(user){
      userFBId: req.user.fb.id
    }

    utils.log(userFBId, "Adding question: "+req.query['question']);

    var question = new Question({
      userId: userFBId,
      text: req.query['question']
    });

    question.save(function (err, question, numAffected) {
       if (err) { return next(err); }
       res.json(question);
     });
  }

  this.getQuestions = function(user, callback){

    Question
      .find({}, {}, function(err, questionsData){
        if(err){
          console.log("err in getQuestions: ");
          console.error(err);

          utils.error(user, "Error while getting questions: ", err);
          callback(null);
        }

        // utils.log(user, "Questions", questionsData);
        callback(questionsData);
      });
  }

  // Get a question by its ID
  this.getQuestionByID = function(questionId, callback){

    var query = Question.where({ _id: questionId });
    console.log("Query:");
    console.log(questionId);
    query.findOne(function(err, question){
      if(err){
        console.log("err in getQuestions: ");
        console.error(err);

        utils.error(user, "Error while getting questions: ", err);
        callback(null);
      }

      if(question){
        callback(question);
      }
    });

  }

}


module.exports = QuestionController;
