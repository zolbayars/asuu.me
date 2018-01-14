'use strict'

var mongoose = require('mongoose');
var request =  require("request");

var Users = require('../models/users.js');
var Question = require('../models/question.js');
var GeneralHelper = require("../helpers/generalHelper.js");
var ResultConstants = require(process.cwd() + "/app/config/result-constants.js");

var ObjectId = mongoose.Schema.Types.ObjectId;

function QuestionController(myCache){

  var utils = new GeneralHelper();

  this.addQuestion = function(user, questionData, callback){

    var result = ResultConstants.UNDEFINED_ERROR;

    utils.log(user, "Adding question", questionData);

    var question = new Question({
      userId: user,
      text: questionData
    });

    question.save(function (err, question, numAffected) {
       if (err) {
        result = ResultConstants.DB_ERROR_WHILE_SAVING;
        utils.error(user, "Error while saving question", err);
        return callback(result);
       }

       result = ResultConstants.SUCCESS;
       result = utils.getSuccessTemplate(result);
       result['question'] = question;

       utils.log(user, "Returning result", result);

       return callback(result);
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
      })
      .sort({createdDate: -1});
  }

  // Get a question by its ID
  this.getQuestionByID = function(questionId, callback){

    var query = Question.where({ _id: questionId });
    query.findOne(function(err, question){
      if(err){
        console.log("err in getQuestions: ");
        console.error(err);

        utils.error("Debug", "Error while getting questions: ", err);
        callback(null);
      }

      if(question){
        callback(question);
      }
    });

  }


  // Get related questions by regex (most of the questions don't have a tag)
  this.getRelatedQuestions = function(questionText, questionId, callback){

      var relatedQuery = Question.where({ text: new RegExp(questionText.split(" ")[0], "i"), _id: {$ne: questionId} });
      relatedQuery.find(function(err, relatedQuestions){
        if(err){
          utils.error("Debug", "Error while getting related questions", err);
          callback(null);
        }

        utils.log("Debug", "Returning rel questions", relatedQuestions);
        callback(relatedQuestions);
      }).limit(5);

    }
}

module.exports = QuestionController;
