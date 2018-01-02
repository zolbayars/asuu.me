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

    this.getTimeAgoMNLocale = function(){
      return function(number, index, total_sec){
          // number: the timeago / timein number;
          // index: the index of array below;
          // total_sec: total seconds between date to be formatted and today's date;
          return [
            ['just now', 'дөнгөж сая'],
            ['%s seconds ago', '%s секундын өмнө'],
            ['1 minute ago', '1 минутын өмнө'],
            ['%s minutes ago', '%s минутын өмнө'],
            ['1 hour ago', '1 цагийн өмнө'],
            ['%s hours ago', '%s цагийн өмнө'],
            ['1 day ago', '1 өдрийн өмнө'],
            ['%s days ago', '%s өдрийн өмнө'],
            ['1 week ago', '7 хоногийн өмнө'],
            ['%s weeks ago', '%s долоо хоногийн өмнө'],
            ['1 month ago', '1 сарын өмнө'],
            ['%s months ago', '%s сарын өмнө'],
            ['1 year ago', '1 жилийн өмнө'],
            ['%s years ago', '%s жилийн өмнө']
          ][index];
      }
    }
}

module.exports = GeneralHelper;
