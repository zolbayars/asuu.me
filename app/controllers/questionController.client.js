'use strict';

(function(){

  $("#ask-quick-question-form").submit(function(event){
    event.preventDefault();
    $("#add-question-warning-container").hide();

    var quickQuestionText = $('#quick-question-input').val();
    if(isValidQuestionText(quickQuestionText) === true){
      $("#ask-btn-text").hide();
      $("#ask-btn-loader").show();

      addQuickQuestion(quickQuestionText.trim(), function(response){
        $("#ask-btn-text").show();
        $("#ask-btn-loader").hide();
        console.log(response);
        if(response.result_code == 1000){

        }else{
          showQuestionWarning(response.result_msg);
        }
      });
    }else{
      showQuestionWarning("Please enter a valid question");
    }

  });

  function showQuestionWarning(msg){
    $("#add-question-warning").text(msg);
    $("#add-question-warning-container").show();
  }

  function addQuickQuestion(questionText, callback){
    console.log(questionText);
    $.ajax({
      type: 'POST',
      url: '/question/add',
      data: { question: questionText },
      success: callback,
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

//Get recommended places -> backend -> Foursquare API
  function getPlaces(){
    $('#places-container').html("");
    $("#loading-img").show();

    $.ajax({
      type: 'POST',
      url: '/places',
      data: $("#venue-search-form").serialize(),
      success: function(response) {
        $("#loading-img").hide();
        // console.log("Response");
        // console.log(response);

        if(response.response_code == 0){
          var html = "";

          response.response_places.forEach(function(element, index){
            html += displayPlace(element, index, response);
          });

          $('#places-container').html(html);

          addGoingBtnEvent();
          addUnGoingBtnEvent();
        }

      },
    });

  }

  function addUnGoingBtnListener(){

    var ungoingBtnId = this.id;
    if(!ungoingBtnId){
      ungoingBtnId = this[0].id;
    }

    var venueId = ungoingBtnId.substring(12, ungoingBtnId.length);


    $(this).on('click', function(event){
      event.preventDefault();

      sendGoingReq('DELETE', venueId, function(response){

        var goingBtnId = "going-btn-"+venueId;
        var goingButton = $("#"+goingBtnId);
        var countElement = $("#count-"+venueId)[0];

        var currentCount = parseInt(countElement.innerText) - 1;
        if(currentCount < 0){
          currentCount = 0;
        }
        goingButton.replaceWith( getCountBtn(venueId, currentCount));;
        addGoingClickListener.call($("#going-btn-"+venueId));

        $("#"+ungoingBtnId).hide();
      });

    });
  }




})();
