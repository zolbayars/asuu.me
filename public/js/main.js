function ajaxCall(method, dataObj, urlString){
  return $.ajax({
    type: method,
    url: urlString,
    data: dataObj
  });
}
