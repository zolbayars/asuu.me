'use strict'

var Users = require('../models/users.js');
var Goings = require('../models/goings.js');
var mongoose = require('mongoose');
var request =  require("request");
var ObjectId = mongoose.Schema.Types.ObjectId;

function PlaceController(myCache){

  var foursquareExploreApi = "https://api.foursquare.com/v2/venues/explore";

// Increasing Going count in the place's button
  this.addGoing = function(req, res){

    console.log("addGoing");
    console.log(req.params);

    var going = new Goings({
      userId: req.user.fb.id,
      venueId: req.params.id
    });

    going.save(function (err) {
       if (err) { return next(err); }
       Goings
          .count({'venueId': req.params.id}, function(error, count){
            res.json(count);
          })
     });
  }

  // Delete a going record
  this.removeGoing = function(req, res){

    console.log("removeGoing");
    console.log(req.params);

    Goings
      .remove({userId: req.user.fb.id, venueId: req.params.id}, function(err){
        if(err) { console.error(err); return next(err); }
        var result = {
          response_msg: "Successfully removed a going",
          response_code: 0
        }
        res.json(result);
      })
  }

  this.getPlaceImage = function(req, res){

    var params = {
      v: "20170701",
      client_id: process.env.FOURSQUARE_CLIENT_ID,
      client_secret: process.env.FOURSQUARE_CLIENT_SECRET
    };

    var options = {
        method: 'GET',
        rejectUnauthorized: false,
        url: 'https://api.foursquare.com/v2/venues/'+ req.params.id +'/photos',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        qs: params
    };

    myCache.get( "venue-img-"+req.params.id, function( err, value ){
      if( !err ){

        var result = {
          response_code: 0,
          response_msg: "Successfully fetched nearby places.",
          image:  "/public/images/default.png"
        }

        if(!value){

          request(options, function (error, response, body) {

            result['response_code'] = 900;
            result['response_msg'] = 'Couldn not connect to the Foursquare server. Try again later.';

            if(!error){
              console.log('Successful getPlaceImage to Foursquare:', response && response.statusCode);
              try{
                if(response.statusCode == 200){
                  var resultObj = JSON.parse(body);

                  let photo = resultObj.response.photos.items[0];
                  let photoUrl = "/public/images/default.png";

                  if(photo){
                      photoUrl = photo.prefix + "300x300" + photo.suffix;
                  }

                  result['image'] = photoUrl;

                  myCache.set("venue-img-"+req.params.id , photoUrl, function(err, success){
                    res.json(result);
                  } );

                }else if (response.statusCode == 429) {
                  result['response_code'] = 429;
                  result['response_msg'] = 'Foursquare quota exceeded.';
                  res.json(result);
                }

              }catch(err){
                console.error("Error during getPlaceImage -> building response: "+err);
                res.json(result);
              }


            }else{
              console.error('Error during getPlaceImage to Foursquare:', error);
              console.error('Response code', response && response.statusCode);
              res.json(result);
            }
          });

        }else{
          console.log( "Showing img from cache" );
          result['image'] = value;
          res.json(result);
        }
      }
    });


  }

// Get near and recommended watering holes from the Foursquare
  this.getNearPlaces = function(req, res){

    //When anonymous user clicks on Going button. After he/she signed in,
    //we need to do the search automatically
    console.log(req.body.shouldClearLastSearch);
    if(req.body.shouldClearLastSearch == "true"){
      myCache.del( "last-search-term" );
    }else{
      if(!req.user){
        myCache.set( "last-search-term", req.body['near-location'] );
      }
    }

    var placesParams = {
      limit: 12,
      intent: "browse",
      near: req.body['near-location'],
      section: "drinks",
      v: "20170701",
      client_id: process.env.FOURSQUARE_CLIENT_ID,
      client_secret: process.env.FOURSQUARE_CLIENT_SECRET
    };

    var placesOptions = {
        method: 'GET',
        rejectUnauthorized: false,
        url: foursquareExploreApi,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        qs: placesParams
    };

    //Try to show places list from the cache
    myCache.get( "search-"+req.body['near-location'], function( err, value ){
      if( !err ){
        if(value == undefined){
          getPlacesFromFS(placesOptions);
        }else{
          console.log( "Showing from cache" );

          getGoingsData(function(err, goingsData){
              if(!err){
                var result = buildSuccessRes(value, goingsData);
                res.json(result);
              }
            });
        }
      }
    });

    //Send request to Foursquare API
    function getPlacesFromFS(placesOptions){
      request(placesOptions, function (error, response, body) {

        var result = {
          response_code: 900,
          response_msg: "Couldn't connect to the Foursquare server. Try again later."
        }

        if(!error){
          console.log('Successful getNearPlaces to Foursquare:', response && response.statusCode);
          try{
            if(response.statusCode == 200){
              var resultObj = JSON.parse(body);
              var places = resultObj.response.groups[0].items;

              // console.log('item:', resultObj.response.groups[0].items);
              getGoingsData(function(err, goingsData){
                  if(!err){
                    result = buildSuccessRes(places, goingsData);
                    myCache.set("search-"+req.body['near-location'], places, function(err, success){
                      res.json(result);
                    } );
                  }
                });

            }else if (response.statusCode == 429) {
              result['response_code'] = 429;
              result['response_msg'] = 'Foursquare quota exceeded.';
              res.json(result);
            }

          }catch(err){
            console.error("Error during getNearPlaces -> building response: "+err);
            res.json(result);
          }


        }else{
          console.error('Error during getNearPlaces to Foursquare:', error);
          console.error('Response code', response && response.statusCode);
          res.json(result);
        }
      });
    }

    function buildSuccessRes(places, goingsData){
      var result = {};
      result['response_code'] = 0;
      result['response_msg'] = 'Successfully fetched nearby places.';
      result['response_places'] = places;
      result['response_goings'] = goingsData;

      if(req.user){
        result['user'] = req.user.fb;
      }

      return result;
    }

    function getGoingsData(callback){
      Goings
        .find({}, {}, function(err, goingsData){
            // console.log("goingsData");
            // console.log(goingsData);

            callback(err, goingsData);
        });
    }

  }

}


module.exports = PlaceController;
