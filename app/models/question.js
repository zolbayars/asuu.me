'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Question = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  text: {
    type: String,
    trim: true
  },
  textDetail: {
    type: String
  },
  slug: {
    type: String
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [],
  votes: Number,
  answers: [],
  comments: []
});

module.exports = mongoose.model('Question', Question);
