'use strict';

(function(){
  $('[data-toggle="popover"]').popover();

  $(".vote-button").click(function(event){

    event.preventDefault();
    // console.log(event);

    let postId = $(event.currentTarget).attr("data-post-id");
    let isPositive = $(event.currentTarget).attr("data-is-positive");
    let postType = $(event.currentTarget).attr("data-post-type");
    let voteId = $(event.currentTarget).attr("data-vote-id");
    let voteSumElement = $("#vote-count-"+postId);

    console.log("postId", postId);
    console.log("isPositive", isPositive);
    console.log("postType", postType);
    console.log("voteId", voteId);

    let isAlreadyClicked = $(event.currentTarget).attr("data-is-already-clicked");

    if(isAlreadyClicked == 1){
      if(isPositive){
        voteSumElement.html(parseInt(voteSumElement.text()) - 1);
        $("#vote-top-chevron-"+postId).attr("src", "/public/images/chevron-top.svg");
      }else{
        voteSumElement.html(parseInt(voteSumElement.text()) + 1);
        $("#vote-bottom-chevron-"+postId).attr("src", "/public/images/chevron-bottom.svg");
      }
      removeVote(postId, postType, voteId, $(event.currentTarget), handleAddVoteError)
    }else{
      if(isPositive){
        voteSumElement.html(parseInt(voteSumElement.text()) + 1);
        $("#vote-top-chevron-"+postId).attr("src", "/public/images/chevron-top-clicked.svg");
      }else{
        voteSumElement.html(parseInt(voteSumElement.text()) - 1);
        $("#vote-bottom-chevron-"+postId).attr("src", "/public/images/chevron-bottom-clicked.svg");
      }
      addVote(postId, isPositive, $(event.currentTarget), handleAddVoteError);
    }


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
      console.log(data);
      // return errorCallback(callback(data));
    });

  }

  function removeVote(postId, postType, voteId, element, errorCallback){

    var ajaxObj = ajaxCall('POST', { 'post-id': postId, 'post-type': postType, 'vote-id': voteId}, '/vote/remove');

    ajaxObj.fail(function(jqXHR, textStatus, errorThrown){

      console.error(jqXHR);
      return errorCallback(element, jqXHR);
    });

    ajaxObj.done(function(data){
      console.log(data);
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
