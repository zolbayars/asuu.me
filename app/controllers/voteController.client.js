'use strict';

(function(){
  $('[data-toggle="popover"]').popover();

  $(".vote-button").click(function(event){

    event.preventDefault();
    // console.log(event);
    let currentElement = $(event.currentTarget);
    let currentElementData = {
      postId: currentElement.attr("data-post-id"),
      isPositive: currentElement.attr("data-is-positive"),
      postType: currentElement.attr("data-post-type"),
      voteId: currentElement.attr("data-vote-id")
    }
    let voteSumElement = $("#vote-count-"+currentElementData.postId);
    let parentElement = $("#vote-div-"+currentElementData.postId);

    console.log("currentElementData", currentElementData);
    console.log("vote children", parentElement.children(".vote-button"));

    if($("#current-user-id").val() != "anonymous"){
      let isAlreadyClicked = currentElement.attr("data-is-already-clicked");

      if(isClickable(parentElement, isAlreadyClicked) === true){
        modifyVoteButtons(currentElement, isAlreadyClicked, voteSumElement, currentElementData);

        isAlreadyClicked == 1 ? removeVote(currentElementData, currentElement, handleAddVoteError)
          : addVote(currentElementData, currentElement, handleAddVoteError);
      }
    }else{
      currentElement.popover('show');
    }
  });

  function addVote(elementData, element, errorCallback){

    var ajaxObj = ajaxCall('POST', {
      'post-id': elementData.postId,
      'is-positive': elementData.isPositive,
      'post-type': elementData.postType }, '/vote/add');

    ajaxObj.fail(function(jqXHR, textStatus, errorThrown){
      // console.error(textStatus);
      // console.error(errorThrown);
      console.error(jqXHR);
      return errorCallback(element, jqXHR);
    });

    ajaxObj.done(function(data){
      element.attr("data-vote-id", data['vote-id']);
      console.log(data);
      // return errorCallback(callback(data));
    });

  }

  function removeVote(elementData, element, errorCallback){

    var ajaxObj = ajaxCall('POST', {
      'post-id': elementData.postId,
      'post-type': elementData.postType,
      'vote-id': elementData.voteId}, '/vote/remove');

    ajaxObj.fail(function(jqXHR, textStatus, errorThrown){

      console.error(jqXHR);
      return errorCallback(element, jqXHR);
    });

    ajaxObj.done(function(data){
      console.log(data);
    });

  }

  // Toggle button image and increase or decrease vote sum value
  function modifyVoteButtons(currentElement, isAlreadyClicked, voteSumElement, elData){
    if(isAlreadyClicked == 1){
      currentElement.attr("data-is-already-clicked", 0);

      if(elData.isPositive == 1){
        voteSumElement.html(parseInt(voteSumElement.text()) - 1);
        $("#vote-top-chevron-"+elData.postId).attr("src", "/public/images/chevron-top.svg");
      }else{
        voteSumElement.html(parseInt(voteSumElement.text()) + 1);
        $("#vote-bottom-chevron-"+elData.postId).attr("src", "/public/images/chevron-bottom.svg");
      }

    }else{
      currentElement.attr("data-is-already-clicked", 1);

      if(elData.isPositive == 1){
        voteSumElement.html(parseInt(voteSumElement.text()) + 1);
        $("#vote-top-chevron-"+elData.postId).attr("src", "/public/images/chevron-top-clicked.svg");
      }else{
        voteSumElement.html(parseInt(voteSumElement.text()) - 1);
        $("#vote-bottom-chevron-"+elData.postId).attr("src", "/public/images/chevron-bottom-clicked.svg");
      }

    }
  }

  // It's clickable when the other button is not clicked or the current button is already clicked
  function isClickable(parentElement, isAlreadyClicked){
    if((parentElement.children(".vote-button")[0].dataset.isAlreadyClicked == 0
        && parentElement.children(".vote-button")[1].dataset.isAlreadyClicked == 0)
      || isAlreadyClicked == 1){
        return true;
    }
    return false;
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
