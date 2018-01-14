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

  this.addAnswer = function(user, answerData, callback){

    var result = ResultConstants.UNDEFINED_ERROR;

    utils.log(user, "Adding answer", answerData);

    var answer = {
      userId: user,
      text: answerData.text,
      createdDate: new Date(),
      point: 0,
      comments: []
    };

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
          result['answer'] = answer;

          utils.log(user, "Returning result", result);

          return callback(result);
      }
    );
  }

}


module.exports = AnswerController;
