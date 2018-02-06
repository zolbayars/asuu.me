'use strict'

var mongoose = require('mongoose');
var request =  require("request");

var Users = require('../models/users.js');
var Question = require('../models/question.js');
var Answer = require('../models/answer.js');
var GeneralHelper = require("../helpers/generalHelper.js");
var ResultConstants = require(process.cwd() + "/app/config/result-constants.js");

var ObjectId = mongoose.Schema.Types.ObjectId;

function AnswerController(myCache){

  var utils = new GeneralHelper();

  this.addAnswer = async function(user, answerData){

    var result = ResultConstants.UNDEFINED_ERROR;

    utils.log(user, "Adding answer", answerData);

    let realUser = null;

    try {
      realUser = await Users.findOne({ 'fb.id': user.id }).exec();
    } catch (e) {
      console.error(e);
      return result;
    }

    var answer = new Answer({
      user: realUser ? realUser._id : null,
      text: answerData.text,
      createdDate: new Date(),
      questionId: answerData['question-id'],
      point: 0,
      comments: []
    });

    try {
      let answerDBResult = await answer.save();
      console.log("answerDBResult", answerDBResult);

      let questionUpdateQuery = Question.findByIdAndUpdate(answerData['question-id'],
        { "$push": { "answers": answerDBResult._id } },
        { "new": true, "upsert": true });

      let updateResult = await questionUpdateQuery.exec();
      console.log("updateResult", updateResult);

      result = utils.getSuccessTemplate(ResultConstants.SUCCESS);
      result['answer'] = answerDBResult;
      result['answer']['user'] = realUser; 
      return result;

    } catch (e) {
      console.error(e);
      result = ResultConstants.DB_ERROR_WHILE_SAVING;
    }

  }

}


module.exports = AnswerController;
