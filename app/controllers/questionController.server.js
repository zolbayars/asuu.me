'use strict'

var mongoose = require('mongoose');
var request =  require("request");

var Users = require('../models/users.js');
var Question = require('../models/question.js');
var Vote = require('../models/vote.js');
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
  this.getQuestionByID = function(questionId, currentUser, callback){

    var query = Question.where({ _id: questionId });
    var populateQuery = [{path:'user'}, {path:'answers', populate: {path: 'user'} }, {path:'votes'}];

    query.findOne(async function(err, question){
      if(err){
        console.log("err in getQuestions: ");
        console.error(err);

        utils.error("Debug", "Error while getting questions: ", err);
        callback(null, null);
      }

      if(question){

        Question.update({ _id: questionId }, { $inc: {views: 1 } }, function(err, raw){
          if(err) console.error(err);
        });

        let voteData = await getVoteData(currentUser, question);

        console.log("question: ",question);
        console.log("vote data: ",voteData);

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

        utils.log("Debug", "Returning rel questions", relatedQuestions);
        callback(relatedQuestions);
      }).limit(5);

    }

// Check if user upvoted or downvoted on a post.
  async function getVoteData(user, question){

    console.log("user in getVoteData", user);
    let voteData = {
      isUserUpVoted: false,
      isUserDownVoted: false
    }

    if(user != 'anonymous' && user.id){
      let realUser = user;
      try {
        realUser = await Users.findOne({ 'fb.id': user.id }).exec();
      } catch (e) {
        realUser = user;
        console.error(e);
        return result;
      }

      console.log("realUser in getVoteData", realUser);

      if(question.votes.length > 0){
        for(var element of question.votes){
          if(element.userId == realUser._id){
            if(element.vote > 0){
              voteData.isUserUpVoted = true;
            }else{
              voteData.isUserDownVoted = true;
            }
            break;
          }
        }
      }
    }

    return voteData;
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
