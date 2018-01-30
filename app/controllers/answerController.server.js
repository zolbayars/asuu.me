'use strict'

var mongoose = require('mongoose');
var request =  require("request");

var Users = require('../models/users.js');
var Question = require('../models/question.js');
var GeneralHelper = require("../helpers/generalHelper.js");
var ResultConstants = require(process.cwd() + "/app/config/result-constants.js");

var ObjectId = mongoose.Schema.Types.ObjectId;

function AnswerController(myCache){

  var utils = new GeneralHelper();

  this.addAnswer = async function(user, answerData, callback){

    var result = ResultConstants.UNDEFINED_ERROR;

    utils.log(user, "Adding answer", answerData);

    let realUser = null;

    try {
      realUser = await Users.findOne({ 'fb.id': user.id }).exec();
    } catch (e) {
      console.error(e);
      return result;
    }

    var answer = {
      user: realUser ? realUser._id : null,
      text: answerData.text,
      createdDate: new Date(),
      questionId: answerData['question-id'], 
      point: 0,
      comments: []
    };

    answer

    Question.findByIdAndUpdate(answerData.question,
      { "$push": { "answers": answer } },
      { "new": true, "upsert": true },
      function (err, question) {
          if (err){
            result = ResultConstants.DB_ERROR_WHILE_SAVING;
            utils.error(user, "Error while saving question", err);
            return callback(result);
          }

          utils.log(user, "Question after updated", question);

          result = ResultConstants.SUCCESS;
          result = utils.getSuccessTemplate(result);
          answer['user'] = realUser;
          result['answer'] = answer;

          utils.log(user, "Returning result", result);

          return callback(result);
      }
    );
  }

}


module.exports = AnswerController;
