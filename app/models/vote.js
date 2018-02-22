'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Vote = new Schema({
  userId: String,
  postId: String,
  vote: Number,
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vote', Vote);
