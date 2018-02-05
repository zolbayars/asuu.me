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

      let questionUpdateQuery = (answerData.question,
        { "$push": { "answers": answerDBResult._id } },
        { "new": true, "upsert": true });
      let updateResult = await questionUpdateQuery.exec();
      console.log("updateResult", updateResult);

      result = ResultConstants.SUCCESS;
      result = utils.getSuccessTemplate(result);
      answer['user'] = realUser;
      result['answer'] = answer;

    } catch (e) {
      console.error(e);
      result = ResultConstants.DB_ERROR_WHILE_SAVING;
    }

  }

}


module.exports = AnswerController;
