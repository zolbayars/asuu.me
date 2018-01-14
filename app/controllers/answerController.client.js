'use strict';

(function(){

  $("#quick-answer-form").submit(function(event){
    event.preventDefault();
    //$("#add-question-warning-container").hide();

    var quickAnswerText = $('#answer-text-input').val();

    if(isValidAnswerText(quickAnswerText) === true){
      $("#answer-btn-text").hide();
      $("#answer-btn-loader").show();
      console.log($('#question-id').val());
      addQuickAnswer($('#question-id').val(), quickAnswerText.trim(), function(error){
        if(error){
          $("#answer-btn-text").show();
          $("#answer-btn-loader").hide();
          showAnswerWarning(error);
        }
      }, function(response){
        console.log(response);
        $("#answer-btn-text").show();
        $("#answer-text-input").val('');
        $("#answer-btn-loader").hide();
        $("#add-answer-result-warning-container").remove();
        $("#answer-list-container").prepend(response);
      });

    }else{
      showAnswerWarning("Please enter a valid answer");
    }

  });

  function showAnswerWarning(msg){
    $("#add-answer-warning").text(msg);
    $("#add-answer-warning-container").show();
  }

  function addQuickAnswer(questionId, answerText, errorCallback, callback){

    var ajaxObj = ajaxCall('POST', { question: questionId, text:  answerText}, '/answer/add');

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

// A valid answer should be consisted with at least 2 words
  function isValidAnswerText(answerText){
    var result = false;
    if(answerText.length > 5){
      var qText = answerText.trim();
      if(qText.split(" ").length >= 2){
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
