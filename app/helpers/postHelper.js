'use strict'

var Users = require('../models/users.js');

// Post - question, answer or comment
function PostHelper() {

    // Check if user upvoted or downvoted on a post.
    this.getVoteData = async function(user, votes, answers = null){

        console.log("user in getVoteData", user);
        let voteData = {
          isUserUpVoted: false,
          isUserDownVoted: false,
          answerVotes: []
        }

        if(user != 'anonymous' && user.id){
          let realUser = user;
          try {
            realUser = await Users.findOne({ 'fb.id': user.id }).exec();
          } catch (e) {
            realUser = user;
            console.error(e);
            return result;
          }

          console.log("realUser in getVoteData", realUser);

          if(votes.length > 0){
            for(var element of votes){
              if(element.userId == realUser._id){
                if(element.vote > 0){
                  voteData.isUserUpVoted = element._id;
                }else{
                  voteData.isUserDownVoted = element._id;
                }
                break;
              }
            }
          }
          console.log("!!!!!!!!!!!!! answers", answers);
          if(answers != null){
            for(var answer of answers){
              for(var element of answer.votes){
                if(element.userId == realUser._id){
                  voteData.answerVotes[element._id] = {
                    vote: element.vote,
                    'vote-id': element._id
                  };
                  break;
                }
              }
            }
          }

        }

        return voteData;
      }
}

module.exports = PostHelper;
