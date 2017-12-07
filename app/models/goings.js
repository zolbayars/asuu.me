'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Going = new Schema({
  userId: String,
  venueId: String
});

module.exports = mongoose.model('Going', Going);
