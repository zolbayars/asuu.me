'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Question = new Schema({
  userId: String,
  text: {
    type: String,
    trim: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  answers: []
});

module.exports = mongoose.model('Question', Question);
