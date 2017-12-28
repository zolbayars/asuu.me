'use strict'

function GeneralHelper() {

    this.log = function(tag, msg, obj = null){
      var objToPrint = obj != null ? ": " + JSON.stringify(obj) : "";
      console.log(new Date() + " " + tag + ": " + msg + objToPrint);
    }

    this.error = function(tag, msg, obj = null){
      var objToPrint = obj != null ? ": " + JSON.stringify(obj) : "";
      console.error(new Date() + " " + tag + ": " + msg + objToPrint);
    }
}

module.exports = GeneralHelper;
