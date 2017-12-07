// var appUrl = window.location.origin;
var ajaxFunctions = {
  // ready: function ready(fn){
  //
  //   if(typeof fn != 'function'){
  //     return;
  //   }
  //
  //   if(document.readyState == "completed"){
  //     return fn();
  //   }
  //
  //   document.addEventListener('DOMContentLoaded', fn, false);
  // },
  ajaxRequest: function ajaxRequest(method, url, callback, params){
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(){

      if(xhr.readyState == 4 && xhr.status == 200){
        callback(xhr.response);
      }
    }

    xhr.open(method, url, true);
    if(params){
      xhr.send(params);
    }else{
      xhr.send();
    }
  }
};
