'use strict';

(function(){
  $('[data-toggle="popover"]').popover();

  $(".vote-button").click(function(event){
    event.preventDefault();
    // console.log(event);

    let postId = $(event.currentTarget).attr("data-post-id");
    let isPositive = $(event.currentTarget).attr("data-is-positive");

    console.log("postId", postId);
    console.log("isPositive", isPositive);

    addVote(postId, isPositive, $(event.currentTarget), handleAddVoteError);

  });

  function addVote(postId, isPositive, element, errorCallback){

    var ajaxObj = ajaxCall('POST', { 'post-id': postId, 'is-positive': isPositive}, '/vote/add');

    ajaxObj.fail(function(jqXHR, textStatus, errorThrown){
      // console.error(textStatus);
      // console.error(errorThrown);
      console.error(jqXHR);
      return errorCallback(element, jqXHR);
    });

    ajaxObj.done(function(data){
      // return errorCallback(callback(data));
    });

  }

  function handleAddVoteError(element, error){
    if(error.responseJSON.result_code == 902){
        element.popover('show');
    }
  }

  function showAnswerWarning(msg){
    $("#add-answer-warning").text(msg);
    $("#add-answer-warning-container").show();
  }

})();
