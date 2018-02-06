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

  // Saving a question
  this.addQuestion = async function(user, questionData, callback){

    var result = ResultConstants.UNDEFINED_ERROR;

    utils.log(user, "Adding question", questionData);
    let realUser = null;

    try {
      realUser = await Users.findOne({ 'fb.id': user.id }).exec();
    } catch (e) {
      console.error(e);
        return result;
    }

    var question = new Question({
      user: realUser ? realUser._id : null,
      text: questionData,
      slug: genSlug(questionData)
    });

    question.save(function (err, question, numAffected) {
       if (err) {
        result = ResultConstants.DB_ERROR_WHILE_SAVING;
        utils.error(user, "Error while saving question", err);
        return callback(result);
       }

       result = ResultConstants.SUCCESS;
       result = utils.getSuccessTemplate(result);
       question['user'] = realUser;
       result['question'] = question;

       utils.log(user, "Returning result", result);

       return callback(result);
     });
  }

  // Get all questions
  this.getQuestions = function(user, callback){

    Question
      .find({}, {}, function(err, questionsData){
        if(err){
          console.log("err in getQuestions: ");
          console.error(err);

          utils.error(user, "Error while getting questions: ", err);
          callback(null);
        }

        //utils.log(user, "Questions", questionsData);
        callback(questionsData);
      })
      .populate('user')
      .sort({createdDate: -1});
  }

  // Get a question by its ID
  this.getQuestionByID = function(questionId, callback){

    var query = Question.where({ _id: questionId });
    var populateQuery = [{path:'user'}, {path:'answers' }];

    query.findOne(function(err, question){
      if(err){
        console.log("err in getQuestions: ");
        console.error(err);

        utils.error("Debug", "Error while getting questions: ", err);
        callback(null);
      }

      if(question){

        Question.update({ _id: questionId }, { $inc: {views: 1 } }, function(err, raw){
          if(err) console.error(err);
        });

        console.log("question: ",question);
        callback(question);
      }
    }).populate(populateQuery);

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

  function genSlug(questionText){
    var splitted = questionText.split(" ");
    var result = "";
    splitted.forEach(function(element, index){
      result = result + element;
      if(index < splitted.length - 1){
        result = result + "-";
      }
    });
    return result;
  }
}

module.exports = QuestionController;
