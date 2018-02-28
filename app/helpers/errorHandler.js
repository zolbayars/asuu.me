'use strict'

// Алдаатай ажиллах ерөнхий аргууд
var Constants = require(process.cwd() + "/app/config/result-constants.js");

function ErrorHandler() {

    this.handle = function(err){
      console.error("error occured", err);

      if(err.hasOwnProperty('isEmpty') && !err.isEmpty()){
        console.error("error occured array", err.array());
        return Constants[err.array().msg];
      }else{
        return Constants['UNDEFINED_ERROR'];
      }

    }
}

module.exports = ErrorHandler;
