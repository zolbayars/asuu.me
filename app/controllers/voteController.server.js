'use strict'

var mongoose = require('mongoose');
var request =  require("request");

var Users = require('../models/users.js');
var Question = require('../models/question.js');
var Answer = require('../models/answer.js');
var Vote = require('../models/vote.js');
var GeneralHelper = require("../helpers/generalHelper.js");
var ResultConstants = require(process.cwd() + "/app/config/result-constants.js");

var ObjectId = mongoose.Schema.Types.ObjectId;

function VoteController(myCache){

  var utils = new GeneralHelper();

  this.addVote = async function(user, voteData){

    var result = ResultConstants.UNDEFINED_ERROR;

    utils.log(user, "Adding vote", voteData);

    let realUser = null;

    try {
      realUser = await Users.findOne({ 'fb.id': user.id }).exec();
    } catch (e) {
      console.error(e);
      return result;
    }

    if(!realUser){
      return ResultConstants.NEED_TO_LOGIN;
    }

    var vote = new Vote({
      userId: realUser._id,
      postId: voteData.postId,
      vote: voteData.point
    });

    try {
      let voteDBResult = await vote.save();
      console.log("answerDBResult", voteDBResult);

      let questionUpdateQuery = Question.findByIdAndUpdate(voteData.postId,
        { "$push": { "votes": voteDBResult._id } },
        { "new": true, "upsert": true },
        { "$inc": { "voteSum": voteData.point } });

      let updateResult = await questionUpdateQuery.exec();
      console.log("updateQuestResult", updateResult);

      result = utils.getSuccessTemplate(ResultConstants.SUCCESS);
      return result;

    } catch (e) {
      console.error(e);
      result = ResultConstants.DB_ERROR_WHILE_SAVING;
    }

  }

  this.removeVote = async function(user, params){

    var result = ResultConstants.UNDEFINED_ERROR;

    utils.log(user, "Removing vote", voteData);

    let realUser = null;

    try {
      realUser = await Users.findOne({ 'fb.id': user.id }).exec();
    } catch (e) {
      console.error(e);
      return result;
    }

    if(!realUser){
      return ResultConstants.NEED_TO_LOGIN;
    }

    //WTF
    try {
      await updateVoteSum(params.postType, params.voteId);
      let removeVoteResult = await Vote.findByIdAndRemove(params.voteId).exec();
      console.log("removeVoteResult", removeVoteResult);

      result = utils.getSuccessTemplate(ResultConstants.SUCCESS);
      return result;

    } catch (e) {
      console.error(e);
      result = ResultConstants.DB_ERROR_WHILE_SAVING;
    }

  }

  async function updateVoteSum(postType, voteId){
    try {
      postObj = Question;

      if(postType == 'answer'){
        postObj = Answer;
      }

      let vote = Vote.findById(params.voteId);
      let valueToChange = -vote.vote;

      let updateVoteSumQuery = postObj.findByIdAndUpdate(params.postId,
        { "$inc": { "voteSum": valueToChange } });
      let updateVoteSumQueryResult = await updateVoteSumQuery.exec();
      console.log("updateVoteSum query result", updateVoteSumQueryResult);
    } catch (e) {
      console.error("Error while updateing vote sum", e);
    }

  }

}


module.exports = VoteController;
