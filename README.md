# Asuu.me
<!-- [![License](https://poser.pugx.org/automattic/jetpack/license.svg)](https://www.gnu.org/licenses/gpl-2.0.html)
[![Code Climate](https://codeclimate.com/github/Automattic/jetpack/badges/gpa.svg)](https://codeclimate.com/github/Automattic/jetpack) -->
[Asuu.me](https://asuu.me/) is a Q&A website so simple, you can't resist your urges to use it.

## Development

We're still developing it and here's the list of features we should implement before the launch.

### TODO

#### v1.0
* Basic Q&A for anonymous, and signed in users
  * Quick question
    * When question was added, show it on top of the list (or reload the list) -> OK
    * Show alert when the question was added successfully -> OK
    * Clear Input after question was added -> OK
    * Fix multiple alerts when questions added after one another -> OK
* Show list of questions on the homepage -> OK
* Question detail page
  * Upvote, Downvote the question  
  * Writing an answer -> OK
  * Related questions 
  * Upvote, Downvote an answer
  * If not anonymous, the user information for (question, answer, comment)
* User ranks
  * Users can accumulate points by answering question

#### v1.1
* Detailed question form
  * Basic form with following functionalities and fields:
    * Title
    * Question body
      * Markdown
    * Tag
      * Auto completion
* Question detail page
  * Writing a comment on an answer
  * Upvote, Downvote a comment
  * Number of views the question got
