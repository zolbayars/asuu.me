'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Answer = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  question: { type: Schema.Types.ObjectId, ref: 'Question' },
  text: {
    type: String,
    trim: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  point: {
    type: Number,
    default: 0
  },
  comments: []
});

module.exports = mongoose.model('Answer', Answer);
