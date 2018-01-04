'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Question = new Schema({
  userId: String,
  text: {
    type: String,
    trim: true
  },
  textDetail: {
    type: String
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  tags: [],
  votes: Number,
  answers: [],
  comments: []
});

module.exports = mongoose.model('Question', Question);