'use strict'

var mongoose = require('mongoose');
var request =  require("request");

var Users = require('../models/users.js');
var Answer = require('../models/answer.js');
var Question = require('../models/question.js');
var GeneralHelper = require("../helpers/generalHelper.js");
var ResultConstants = require(process.cwd() + "/app/config/result-constants.js");

var ObjectId = mongoose.Schema.Types.ObjectId;

function QuestionController(myCache){

  var utils = new GeneralHelper();

  this.addQuestion = function(req, res, next){

    var result = ResultConstants.UNDEFINED_ERROR;

    var user = req.user;
    var userFBId = 'anonymous';
    if(user){
      userFBId: req.user.fb.id
    }

    utils.log(userFBId, "Adding question: "+req.body['question']);

    var question = new Question({
      userId: userFBId,
      text: req.body['question']
    });

    question.save(function (err, question, numAffected) {
       if (err) {
        result = ResultConstants.DB_ERROR_WHILE_SAVING;
        utils.error(userFBId, "Error while saving question", err);
        return res.json(result);
       }

       result = ResultConstants.SUCCESS;
       utils.log(userFBId, "Before before Returning result", result);
       result = utils.getSuccessTemplate(result);
       utils.log(userFBId, "Before Returning result", result);

       result['question'] = question;

       utils.log(userFBId, "Returning result", result);

       res.json(result);
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
