'use strict';

(function(){

  (function (){
    switch ($('#active-nav-type').val()) {
      case 'viewed':
        $('#nav-viewed').addClass('active');
        break;
      case 'answered':
        $('#nav-answered').addClass('active');
        break;
      case 'voted':
        $('#nav-voted').addClass('active');
        break;
      default:
        $('#nav-recent').addClass('active');
    }
  })();

  let loadMoreClicked = false;

  function questionsBtnClick(){
    let currentLimit = $('#limit-count').val();
    let currentSkip = $('#skip-count').val();
    let currentPerPage = $('#per-page-count').val();

    let newSkip = parseInt(currentSkip) + parseInt(currentPerPage);
    let newLimit = parseInt(currentLimit);

    $('#limit-count').val(newLimit);
    $('#skip-count').val(newSkip);

    let params = {
      skip: newSkip,
      limit: newLimit
    }

    loadMoreClicked = true;

    $('#load-more-question-btn').off("click", questionsBtnClick);
    $("#load-question-btn-text").hide();
    $("#load-question-btn-loader").show();

    loadMoreQuestions(params,
      function moreQuestionError(error){
        if(error){
          loadMoreClicked = false;
          $('#load-more-question-btn').on("click", questionsBtnClick);
          $("#load-question-btn-text").show();
          $("#load-question-btn-loader").hide();
          showQuestionWarning(error);
        }
      },
      function moreQuestionSuccess(data){
        loadMoreClicked = false;
        $('#load-more-question-btn').on("click", questionsBtnClick);
        $("#load-question-btn-text").show();
        $("#load-question-btn-loader").hide();

        if(data != null && data.hasOwnProperty('result_code') && data.result_code == 905){
          $('#load-more-question-btn').hide(); 
        }

        $("#add-question-result-warning-container").remove();
        $("#question-list-container").append(data);
      });
  }

  // Loading more questions by pagination values
  $('#load-more-question-btn').click(function(event){
    if(!loadMoreClicked){
      questionsBtnClick();
    }
  });

  //Submitting quick question
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

  // Warning if there is an error in inserting question
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

  function loadMoreQuestions(params, errorCallback, callback){

    var ajaxObj = ajaxCall('GET', params, '/');

    ajaxObj.fail(function(jqXHR, textStatus, errorThrown){
      console.error(textStatus);
      console.error(errorThrown);
      console.error(jqXHR);
      return errorCallback(errorThrown);
    });

    ajaxObj.done(function(data){
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
