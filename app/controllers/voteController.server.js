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
      console.log("voteDBResult", voteDBResult);

      let questionUpdateQuery = Question.findByIdAndUpdate(voteData.postId,
        { "$inc": { "voteSum": voteData.point } ,
        "$push": { "votes": voteDBResult._id } },
        { "new": true, "upsert": true });
      let updateResult = await questionUpdateQuery.exec();

      console.log("updateQuestResult", updateResult);
      updateVoteSum({'post-id': voteData.postId, 'vote-id': voteDBResult._id, 'post-type': 'question'});

      result = utils.getSuccessTemplate(ResultConstants.SUCCESS);
      return result;

    } catch (e) {
      console.error("error in vote saving", e);
      return ResultConstants.DB_ERROR_WHILE_SAVING;
    }

  }

  //Remove Vote object and decrease or increase the voteSum of a related post
  this.removeVote = async function(user, params){

    var result = ResultConstants.UNDEFINED_ERROR;

    utils.log(user, "Removing vote", params);

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
      await updateVoteSum(params);
      let removeVoteResult = await Vote.findByIdAndRemove(params['vote-id']).exec();
      console.log("removeVoteResult", removeVoteResult);

      result = utils.getSuccessTemplate(ResultConstants.SUCCESS);
      return result;

    } catch (e) {
      console.error(e);
      result = ResultConstants.DB_ERROR_WHILE_SAVING;
    }

  }

  // Updating vote sum on a post
  async function updateVoteSum(params){
    try {
      let postObj = Question;

      if(params['post-type'] == 'answer'){
        postObj = Answer;
      }

      let vote = Vote.findById(params['vote-id']);
      let valueToChange = -vote.vote;

      let updateVoteSumQuery = postObj.findByIdAndUpdate(params['post-id'],
        { "$inc": { "voteSum": valueToChange } });
      let updateVoteSumQueryResult = await updateVoteSumQuery.exec();
      console.log("updateVoteSum query result", updateVoteSumQueryResult);
    } catch (e) {
      console.error("Error while updateing vote sum", e);
    }

  }

}


module.exports = VoteController;
