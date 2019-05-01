const app = require('express')();
var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer();
const LicenseServer = require('./licenseServer');
const config = require('./config.json');
const uuid = require('uuidv4');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/*
// use express to handle incomming request
// use simple-oauth2 for oauth
// use axios for passing api requests to app.clio.com
// store tokens on the server so they do not leak on client apps
// handle license key generation and storage
// in memory DB for fast access to already retrieved data
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
const oauth2 = require('simple-oauth2').create(credentials);

const users = [
    { id: '2f24vvg', email: 'test@test.com', password: 'password' }
]

// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
        console.log('Inside local strategy callback')
        // here is where you make a call to the database
        // to find the user based on their username or email address
        // for now, we'll just pretend we found that it was users[0]
        const user = users[0]
        if (email === user.email && password === user.password) {
            console.log('Local strategy returned true')
            return done(null, user)
        }
    }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    console.log('Inside serializeUser callback. User id is save to the session file store here')
    done(null, user.id);
});

// add & configure middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
    genid: (req) => {
        console.log('Inside the session middleware: ', req.sessionID)
        return uuid() // use UUIDs for session IDs
    },
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// create the login get and post routes
app.get('/login', (req, res) => {
    console.log('Inside GET /login callback function')
    console.log(req.sessionID)
    LicenseServer.getLicense(req.params.user);
    res.redirect(`http://localhost:${config.expressPort}/login`);
})

app.post('/login', (req, res, next) => {
    console.log('Inside POST /login callback')
    passport.authenticate('local', (err, user, info) => {
        console.log('Inside passport.authenticate() callback');
        console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
        console.log(`req.user: ${JSON.stringify(req.user)}`)
        req.login(user, (err) => {
            console.log('Inside req.login() callback')
            console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
            console.log(`req.user: ${JSON.stringify(req.user)}`)
            return res.send('You were authenticated & logged in!\n');
        })
    })(req, res, next);
})


app.get('/oauth/response', async (req, res) => {
    console.log("oauth/response: ", req.query.code);
    const tokenConfig = {
        client_id: config.id,
        client_secret: config.secrect,
        code: req.query.code,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
    };

    // TODO: Save the access token for a specific user
    try {
        const result = await oauth2.authorizationCode.getToken(tokenConfig)
        console.log("result:", result);
        accessToken = oauth2.accessToken.create(result);
        console.log("accessToken:", accessToken);

        // redirect to the application home page
        res.redirect(`http://localhost:${config.expressPort}/login`);

    } catch (error) {
        console.log('Access Token Error', error);
    }
});

app.get('/oauth', (req, res) => {
    console.log("oauth");

    const authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: config.redirectUri,
    });
    res.redirect(authorizationUri);
});

app.get('/api/v4/*', (req, res) => {
    console.log("redirecting to clio API");
    req.headers.Authorization = `Bearer ${accessToken}`;
    apiProxy.web(req, res, { target: config.apiHost });
})

app.get('/authrequired', (req, res) => {
    console.log('Inside GET /authrequired callback')
    console.log(`User authenticated? ${req.isAuthenticated()}`)
    if (req.isAuthenticated()) {
        res.send('you hit the authentication endpoint\n')
    } else {
        res.redirect('/')
    }
})

app.get('/*', (req, res) => {
    console.log("redirecting to app", `http://localhost:${config.webpackPort}` + req.originalUrl);
    console.log("Session ID: ", req.sessionID);
    apiProxy.web(req, res, { target: `http://localhost:${config.webpackPort}` });
})

app.listen(config.expressPort, () => {
    console.log(`Listening on localhost:${config.expressPort}`)
});
