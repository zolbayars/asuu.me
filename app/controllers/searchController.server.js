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

function SearchController(myCache){

  var utils = new GeneralHelper();
  var postHelper = new PostHelper();

  this.search = async function(searchKey, sortBy, skip, limit){

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

    let queryObj = {
      text: { $regex: '.*' + searchKey + '.*' }
    };

    let queryResult = null;
    try {
      queryResult = await Question
        .find(queryObj, {}, { skip: skip, limit: limit }, async function(err, questionsData){
          if(err){
            utils.error(user, "Error in question search: ", err);
            throw new Error(err);
          }
        })
        .populate('user')
        .sort(sortObj);
    } catch (e) {
      console.error("AAAAAAAAAAAAAAAAAAAAAAAA");
      console.error(e);
    }

    return queryResult;
  }

}

module.exports = SearchController;
