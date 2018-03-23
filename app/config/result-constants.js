module.exports = {
  SUCCESS: {
    result_code: 1000,
    result_msg: "Success",
  },
  UNDEFINED_ERROR: {
    result_code: 900,
    result_msg: "Undefined error has occured",
  },
  DB_ERROR_WHILE_SAVING: {
    result_code: 901,
    result_msg: "An error occured while saving",
  },
  NEED_TO_LOGIN: {
    result_code: 902,
    result_msg: "You should login",
  },
  ALREADY_VOTED: {
    result_code: 903,
    result_msg: "You already voted for this post",
  },
  COULD_NOT_FIND_USER_IN_DB: {
    result_code: 904,
    result_msg: "User not registered in our DB",
  },
  NO_MORE_QUESTIONS: {
    result_code: 905,
    result_msg: "No more questions in our DB",
  },
  NO_MORE_ANSWERS: {
    result_code: 906,
    result_msg: "No more answerResult in our DB",
  },
  400: {
    result_code: 400,
    result_msg: "Invalid parameters",
  },
  403: {
    result_code: 403,
    result_msg: "Authentication required",
  }
}
