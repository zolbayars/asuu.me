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

    var vote = new Vote({
      userId: user._id,
      postId: voteData.postId,
      vote: voteData.point
    });

    try {

      let existingVote = await Vote.find({
        $and: [
          { userId: user._id },
          { postId: voteData.postId }
        ]
      }).exec();

      if(existingVote && existingVote.length > 0){
        return ResultConstants.ALREADY_VOTED;
      }

      let voteDBResult = await vote.save();
      console.log("vote saved result\n", voteDBResult);

      let questionUpdateQuery = Question.findByIdAndUpdate(voteData.postId,
        { "$inc": { "voteSum": voteData.point } ,
        "$push": { "votes": voteDBResult._id } },
        { "new": true, "upsert": true });
      let updateResult = await questionUpdateQuery.exec();

      return utils.getSuccessTemplate(ResultConstants.SUCCESS);

    } catch (e) {
      console.error("error while vote saving", e);
      return ResultConstants.DB_ERROR_WHILE_SAVING;
    }

  }

  //Remove Vote object and decrease or increase the voteSum of a related post
  this.removeVote = async function(params){

    try {
      await updateVoteSum(params, true);
      let removeVoteResult = await Vote.findByIdAndRemove(params['vote-id']).exec();
      console.log("removeVoteResult", removeVoteResult);

      return utils.getSuccessTemplate(ResultConstants.SUCCESS);

    } catch (e) {
      console.error(e);
      result = ResultConstants.DB_ERROR_WHILE_SAVING;
    }

  }

  // Updating vote sum on a post
  async function updateVoteSum(params, isRemoval){
    try {
      let postObj = Question;

      if(params['post-type'] == 'answer'){
        postObj = Answer;
      }

      let vote = await Vote.findById(params['vote-id']);
      let valueToChange = vote.vote;
      if(isRemoval){
        valueToChange = -valueToChange;
      }
      console.log("vote.vote", vote.vote);
      console.log("valueToChange", valueToChange);

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
