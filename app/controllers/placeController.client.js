'use strict';

(function(){

  var itemsInRow = 3;

  if(lastSearchTermData){
    // console.log("lastSearchTermData: ");
    // console.log(lastSearchTermData);

    getPlaces();
  }

  $("#venue-search-form").submit(function(event){
    event.preventDefault();
    getPlaces();
  });

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

//Display a place info
  function displayPlace(element, index, response){
    let defaultTipText = "Nice place";
    var user = null;
    var html = "";

    if(response.user){
      user = response.user;
    }

    var propObj = getProperties(response.response_goings, element.venue.id, user);
    var goingBtn = getCountBtn(element.venue.id, propObj.count);

    if(propObj.didIClick){
      goingBtn = getClickedCountBtn(element.venue.id, propObj.count);
    }

    if(element.tips){
      defaultTipText = element.tips[0].text;
    }

    if(index % itemsInRow === 0){
      html += '<div class="card-deck">';
    }

    html += getVenueCard(element.venue.id, element.venue.name, defaultTipText, goingBtn);

    if((index + 1) % itemsInRow === 0){
      html += '</div>';
    }

    getVenueImg(element.venue.id, 'img-'+element.venue.id);

    return html;
  }

//Add click event to every place's button
  function addGoingBtnEvent(){
    $(".going-btn").each(function(){
      addGoingClickListener.call(this);
    });
  }

  function addGoingClickListener(){
    var btnId = $(this).attr('id');
    var venueId = btnId.substring(10, btnId.length);


    $(this).on('click', function(event){

      event.preventDefault();

      sendGoingReq('POST', venueId, function(response){
        var currentCount = parseInt($("#count-"+venueId)[0].innerText) + 1;

        $("#"+btnId).replaceWith(getClickedCountBtn(venueId, currentCount));
        addUnGoingBtnListener.call($("#ungoing-btn-"+venueId));
      });

    });
  }

  //Add ungoing click event to every place's button
  function addUnGoingBtnEvent(){
    $(".ungoing-btn").each(function(){
      addUnGoingBtnListener.call(this)
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

  function sendGoingReq(method, btnId, callback){
    $.ajax({
      type: method,
      url: '/places/going/'+ btnId,
      data: {},
      success: function(response) {
        if(response.result_code == 800){
          window.location = response.result_redirect_url;
        }else{
          callback(response);
        }
      },
    });
  }


//Goings count for this place and whether did I click on it
  function getProperties(goings, venueId, user){
    var result = {
      count: 0,
      didIClick: false
    }

    if(typeof goings !== undefined && goings != null){
      if(goings.length > 0){
        goings.forEach(function(element){
          // console.log(element.venueId+ " - " + venueId);
          if(element.venueId == venueId){

            result.count++;

            if(user){
              if(element.userId == user.id){
                result.didIClick = true;
              }
            }
          }

        });
      }
    }

    return result;
  }

//Most places doesn't have default photo on them. So I had to get thom from separate API
  function getVenueImg(venueId, imgElementId){

    $.ajax({
      type: 'GET',
      url: '/places/photo/'+ venueId,
      data: {},
      success: function(response) {
        $('#'+imgElementId).attr('src', response.image).attr('width', 300);
      },
    });
  }

  function getCountBtn(id, count){
    return '<a href="#" id="going-btn-'+ id  +
      '" class="btn btn-success going-btn" role="button">Going <span class="going-count" id="count-'+ id +'">'+
      count +'</span></a>'
  }

  function getClickedCountBtn(id, count){
    return '<a href="#" id="going-btn-'+ id  + '" class="btn btn-secondary '+
      'disabled going-btn" data-isChecked="true" role="button">'+
      'Going <span class="going-count" id="count-'+ id +'">'+
      count +'</span></a>' +
      '<a href="#" id="ungoing-btn-'+ id  +
        '" class="btn btn-danger ungoing-btn" data-isChecked="true" role="button">Not going</a>';
  }

  function getVenueCard(venueId, venueName, defaultTipText, goingBtn){
    return '<div class="card">' +
      '<div class="place-img-container">' +
        '<img class="card-img-top" src="/public/images/default.png" width="300" height="300" id="img-'+ venueId +'" alt="...">' +
      '</div>' +
      '<div class="card-block">' +
        '<h4 class="card-title">'+ venueName +'</h4>' +
        '<p class="card-text">'+ defaultTipText +'</p>' +
        goingBtn +
      '</div>' +
    '</div>';
  }



})();
