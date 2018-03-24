'use strict';

(function(){

  let loadMoreClicked = false;

  $("#quick-answer-form").submit(function(event){
    event.preventDefault();
    //$("#add-question-warning-container").hide();

    var quickAnswerText = $('#answer-text-input').val();

    if(isValidAnswerText(quickAnswerText) === true){
      $("#answer-btn-text").hide();
      $("#answer-btn-loader").show();

      addQuickAnswer($('#question-id').val(), quickAnswerText.trim(), function(error){
        if(error){
          $("#answer-btn-text").show();
          $("#answer-btn-loader").hide();
          showAnswerWarning(error);
        }
      }, function(response){
        $("#answer-btn-text").show();
        $("#answer-text-input").val('');

        console.log($("#answer-count").text());
        $("#answer-count").text(parseInt($("#answer-count").text()) + 1);
        $("#answer-btn-loader").hide();
        $("#add-answer-result-warning-container").remove();
        $("#answer-list-container").append(response);
      });

    }else{
      showAnswerWarning("Please enter a valid answer");
    }

  });

  function moreAnswerBtnClick(){
    let currentSkip = $('#skip-count').val();
    let currentPerPage = $('#per-page-count').val();

    let newSkip = parseInt(currentSkip) + parseInt(currentPerPage);

    $('#skip-count').val(newSkip);

    let params = {
      skip: newSkip
    }

    loadMoreClicked = true;

    $('#load-more-answer-btn').off("click", moreAnswerBtnClick);
    $("#load-answer-btn-text").hide();
    $("#load-answer-btn-loader").show();

    loadMoreAnswers(params,
      function moreAnswersError(error){
        if(error){
          loadMoreClicked = false;
          $('#load-more-answer-btn').on("click", moreAnswerBtnClick);
          $("#load-answer-btn-text").show();
          $("#load-answer-btn-loader").hide();
          showAnswerWarning(error);
        }
      },
      function moreAnswersSuccess(data){
        loadMoreClicked = false;
        $('#load-more-answer-btn').on("click", moreAnswerBtnClick);
        $("#load-answer-btn-text").show();
        $("#load-answer-btn-loader").hide();

        if(data != null && data.hasOwnProperty('result_code') && data.result_code == 906){
          $('#load-more-answer-btn').hide();
        }

        $("#add-answer-result-warning-container").remove();
        $("#answer-list-container").append(data);
      });
  }

  // Loading more answers by pagination values
  $('#load-more-answer-btn').click(function(event){
    if(!loadMoreClicked){
      moreAnswerBtnClick();
    }
  });

  $("#question-like").click(function(){
    console.log("hoho");
    console.log("<%= user %>");
  });

  function showAnswerWarning(msg){
    $("#add-answer-warning").text(msg);
    $("#add-answer-warning-container").show();
  }

  function addQuickAnswer(questionId, answerText, errorCallback, callback){

    // console.log(answerText);
    var ajaxObj = ajaxCall('POST', { 'question-id': questionId, 'text': answerText}, '/answer/add');

    ajaxObj.fail(function(jqXHR, textStatus, errorThrown){
      console.error(textStatus);
      console.error(errorThrown);
      console.error(jqXHR);
      return errorCallback(errorThrown);
    });

    ajaxObj.done(function(data){
      // console.log(data);
      return callback(data);
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

  function loadMoreAnswers(params, errorCallback, callback){

    var ajaxObj = ajaxCall('GET', params, '/questions/' + $("#question-id").val() + '/' + $("#question-slug").val());

    ajaxObj.fail(function(jqXHR, textStatus, errorThrown){
      console.error(textStatus);
      console.error(errorThrown);
      console.error(jqXHR);
      return errorCallback(errorThrown);
    });

    ajaxObj.done(function(data){
      // console.log(data);
      return callback(data);
    });

  }

  function ajaxCall(method, dataObj, urlString){
    return $.ajax({
      type: method,
      url: urlString,
      data: dataObj
    });
  }

})();
