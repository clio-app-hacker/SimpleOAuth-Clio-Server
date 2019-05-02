# SimpleOAuth-Clio-Server
A simple OAuth server for clio manage

## Prerequisites/Tools

nodeJS and yarn (though npm will work too)

you can use either nvm or nodenv (prefered by clio) to set you nodeJS and npm versions

```
brew install nodenv
nodenv -install 10.9.0
nodenv global 10.9.0
brew install yarn
npm install -g nodemon
```


## Setup
Edit ./src/server/config.json and fill in the Client ID and Client Secrect (Or use the one already configured)

You can get those from https://app.clio.com/nc/#/settings?path=settings%2Fdeveloper_applications

## Run
1. yarn install (or `npm install`)
2. yarn start (or `npm start`)

## Test

http://localhost:3001/oauth will do the OAuth authentication

If successful your Browser should have been redirected to http://localhost:3001/done and show "Setup done" in the Browser window.

After that you can use `http://localhost:3001/api/v4/matters?fields=id,description,client{name,type}` to retrieve matters form the authorized account.

Try:
 * `http://localhost:3001/api/v4/contacts`
 * `http://localhost:3001/api/v4/activities`
 * `http://localhost:3001/api/v4/relationships`
 * `http://localhost:3001/api/v4/bills`

 You can also name specific fields (see https://app.clio.com/api/v4/documentation)

 * `http://localhost:3001/api/v4/calendars?fields=owner,type`
 * `http://localhost:3001/api/v4/communications?fields=type,subject,matter,user,senders{name,type}`
 

