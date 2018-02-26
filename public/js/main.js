$( document ).ready(function() {
    $('#login-btn-anchor').attr('href', $('#login-btn-anchor').attr('href')+window.location.pathname); 
});

function ajaxCall(method, dataObj, urlString){
  return $.ajax({
    type: method,
    url: urlString,
    data: dataObj
  });
}
