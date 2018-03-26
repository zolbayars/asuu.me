# Asuu.me

[Asuu.me](https://asuu.me/) is a Q&A website built for real-life node.js practice.

## Installation

1. `git clone` this repository
2. `npm install`
3. Create .env file on the root dir with following content:

```javascript
# //Put here your facebook app id 
FACEBOOK_APP_ID=00000000000000000

# //facebook app secret
FACEBOOK_APP_SECRET=00000000000000000000000000000

# //your mongodb uri. Using mlab is fine. (mongodb://user:pass@dsid.mlab.com:23718/asuume etc)
MONGO_URI=mongodb_uri

# //server port
PORT=80

# //server url. To use this, edit hosts file accordingly. (In Windows: C:\Windows\System32\drivers\etc\hosts)
APP_URL=http://local.asuu.me/
``` 
4. `npm run` to start the server 
5. Now open `local.asuu.me` on your browser

## Development

We're still developing it and here's the list of features we need in near future.

### TODO

#### v1.1.1
* Update with best practices
  * HTML & CSS
  * Node.js

#### v1.2
* Browser notifications
  * When question is voted
  * When question is answered
  * When answer is voted

#### v1.3
* User points
  * By question votes  
  * By answer votes

#### v1.4
* User info
  * Show user score and rank in question detail page
  * User profile page
    * Score and rank
    * questions asked
    * answers provided

#### v1.5    
* Detailed question form -> 03/04
  * Basic form with following functionalities and fields:
    * Title
    * Question body
      * Markdown
    * Tag
      * Auto completion
