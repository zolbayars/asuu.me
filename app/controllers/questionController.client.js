'use strict';

(function(){

  $("#ask-quick-question-form").submit(function(event){
    event.preventDefault();
    $("#add-question-warning-container").hide();

    var quickQuestionText = $('#quick-question-input').val();
    if(isValidQuestionText(quickQuestionText) === true){
      $("#ask-btn-text").hide();
      $("#ask-btn-loader").show();

      addQuickQuestion(quickQuestionText.trim(), function(error){
        if(error){
          $("#ask-btn-text").show();
          $("#ask-btn-loader").hide();
          showQuestionWarning(error);
        }
      }, function(response){
        $("#ask-btn-text").show();
        $("#quick-question-input").val('');
        $("#ask-btn-loader").hide();
        $("#add-question-result-warning-container").remove();
        $("#question-list-container").prepend(response);
      });

    }else{
      console.log("called from else");
      showQuestionWarning("Please enter a valid question");
    }

  });

  function showQuestionWarning(msg){
    console.log("warning called");
    $("#add-question-warning").text(msg);
    $("#add-question-warning-container").show();
  }

  function addQuickQuestion(questionText, errorCallback, callback){

    var ajaxObj = ajaxCall('POST', { question: questionText }, '/question/add');

    ajaxObj.fail(function(jqXHR, textStatus, errorThrown){
      console.error(textStatus);
      console.error(errorThrown);
      console.error(jqXHR);
      return errorCallback(errorThrown);
    });

    ajaxObj.done(function(data){
      return errorCallback(callback(data));
    });

  }

// A valid question should be consisted with at least 3 words
  function isValidQuestionText(questionText){
    var result = false;
    if(questionText.length > 10){
      var qText = questionText.trim();
      if(qText.split(" ").length >= 3){
        result = true;
      }
    }

    return result;
  }



  function ajaxCall(method, dataObj, urlString){
    return $.ajax({
      type: method,
      url: urlString,
      data: dataObj
    });
  }




})();
