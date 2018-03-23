'use strict'

var mongoose = require('mongoose');
var request =  require("request");

var Users = require('../models/users.js');
var Question = require('../models/question.js');
var Vote = require('../models/vote.js');
var GeneralHelper = require("../helpers/generalHelper.js");
var PostHelper = require("../helpers/postHelper.js");
var ResultConstants = require(process.cwd() + "/app/config/result-constants.js");

var ObjectId = mongoose.Schema.Types.ObjectId;

function QuestionController(myCache){

  var utils = new GeneralHelper();
  var postHelper = new PostHelper();

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
  this.getQuestions = function(user, sortBy, skip, limit, callback){

    let sortObj = {createdDate: -1};

    switch (sortBy) {
      case 'voted':
        sortObj = { voteSum: -1 };
        break;
      case 'viewed':
        sortObj = { views: -1 };
        break;
      case 'answered':
        sortObj = { answers: -1 };
        break;
    }

    Question
      .find({}, {}, { skip: skip, limit: limit }, function(err, questionsData){
        if(err){
          console.log("err in getQuestions: ");
          console.error(err);

          utils.error(user, "Error while getting questions: ", err);
          callback(null);
        }

        // utils.log(user, "skip and limit: ", skip + " - " + limit);
        // utils.log(user, "Questions len: ", questionsData.length);

        callback(questionsData);
      })
      .populate('user')
      .sort(sortObj);
  }

  // Get a question by its ID
  this.getQuestionByID = function(questionId, currentUser, callback){

    var query = Question.where({ _id: questionId });
    var populateQuery = [{path:'user'}, {path:'answers', populate: [{path: 'user', model: 'User'}, {path: 'votes', model: 'Vote'}] }, {path:'votes'}];

    query.findOne(async function(err, question){
      if(err){
        console.log("err in getQuestions: ");
        console.error(err);

        utils.error("Debug", "Error while getting questions: ", err);
        callback(null, null);
      }

      console.log("question in da house", question);

      if(question){

        Question.update({ _id: questionId }, { $inc: {views: 1 } }, function(err, raw){
          if(err) console.error(err);
        });

        let voteData = await postHelper.getVoteData(currentUser, question.votes, question.answers);

        console.log("question: ",question);
        // console.log("vote data: ",voteData);

        callback(question, voteData);
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

        // utils.log("Debug", "Returning rel questions", relatedQuestions);
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
