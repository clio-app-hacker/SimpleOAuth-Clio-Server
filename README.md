# SimpleOAuth-Clio-Server
A simple OAuth server for clio manage

## Setup
Edit ./src/server/config.json and fill in the Client ID and Client Secrect.

You can get those from https://app.clio.com/nc/#/settings?path=settings%2Fdeveloper_applications

## Run
yarn start

## Test

http://localhost:3001/oauth will do the OAuth authentication

If successful you Browser should have been refirected to http://localhost:3001/done and show "Setup done" in the Browser window.

After that you can use `http://localhost:3001/api/v4/matters?fields=id,description,client{name,type}` to retrieve matters form the authorized account.

