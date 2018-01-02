'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Comment = new Schema({
  userId: String,
  postId: String,
  text: {
    type: String,
    trim: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  votes: Number
});

module.exports = mongoose.model('Comment', Comment);
