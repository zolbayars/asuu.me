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

We're still developing it and really appreciate any kind of contribution :sparkles:. You can see our kanban board [here](https://github.com/zolbayars/asuu.me/projects/1) and develop anything on the "To do" column right away :wink:. 
