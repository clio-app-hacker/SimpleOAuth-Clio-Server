const app = require('express')();
const ApiServer = require('./apiServer');
const config = require('./config.json');
const uuid = require('uuidv4');
const session = require('express-session');
var FileStore = require('session-file-store')(session);

/**
 * use express to handle incomming request
 * use simple-oauth2 for oauth
 * use axios for passing api requests to app.clio.com
 */
const credentials = {
    client: {
        id: config.id,
        secret: config.secrect
    },
    auth: {
        tokenHost: config.tokenHost
    }
};

// create oauth instance using credentials
const oauth2 = require('simple-oauth2').create(credentials);

// add & configure session middleware
app.use(session({
    genid: (req) => {
        return uuid() // use UUIDs for session IDs
    },
    secret: 'testtesttest',
    resave: false,
    store: new FileStore,
    saveUninitialized: true
}));

/**
 * Done route - for testing mostly...
 */
app.get('/done', async (req, res) => {
    res.send(`<pre>Setup done</pre>`);
});

/**
 * Simple route for all /api/v4 get requests
 */
app.get('/api/v4/*', async (req, res) => {

    // check if we already stored a token in the session for this user
    if (req.session.clio_token) {
        console.log("/api/v4/*: ", req.sessionID);
        try {
            // get the data using the token from the server side stored session 
            const result = await ApiServer.get(req._parsedOriginalUrl.path, req.session.clio_token.access_token);
            res.send(result.data);
        } catch (e) {
            console.log("Error:", e);
            res.send("Error");
        }
    } else {
        // no token hence NO FREAKING ACCESS !!!
        res.send("Not Autorized");
    }
});

/**
 * Initial oauth response which contains the code to use to request
 * an access token.
 * 
 * Note: This code is specific to a user and their env.
 */
app.get('/oauth/response', async (req, res) => {
    console.log("/oauth/response: ", req.query.code);
    console.log("/oauth/response SessionID: ", req.sessionID);

    // use the returned code to get the token
    //  - pass in the required attributes
    //  - redirect_uri has to be the same as the one used in the authorizationUri
    const tokenConfig = {
        client_id: config.id,
        client_secret: config.secrect,
        code: req.query.code,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
    };

    try {
        const result = await oauth2.authorizationCode.getToken(tokenConfig)
        console.log("result:", result);

        // store the access token with the session
        // THIS IS REALLY IMPORTANT !!! 
        // This makes sure we do not access data of another user !
        req.session.clio_token = result;

        // since we changed the session (added token), we need to save it
        req.session.save();
        console.log("/oauth/response Session: ", req.session);

        // redirect to the application done page
        res.redirect(`http://localhost:3005/done`);

    } catch (error) {
        console.log('Access Token Error', error);
    }
});

/**
 * OAuth entry point
 */
app.get('/oauth', (req, res) => {
    console.log("oauth: ");

    // create a authorizationUri using simple-oauth2 library
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: config.redirectUri,
    });

    console.log("authorizationUri created")

    // redirect to app.clio.com for authentication
    // this will trigger OAuth 2 flow
    res.redirect(authorizationUri);
});

/**
 * Catch all, return unsupported request
 */
app.get('/*', (req, res) => {
    res.send(`Unsupported request: ${req._parsedOriginalUrl.path}`)
});

// start listening on configured port
app.listen(config.proxyPort, () => {
    console.log(`Listening on localhost:${config.proxyPort}`)
});
