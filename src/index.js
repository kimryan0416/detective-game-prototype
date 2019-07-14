// --------------------------------------------
// --- REQUIRE() STATEMENTS ---
// --------------------------------------------
// : Require basic stuff
const fs = require('fs');
const path = require('path');
// : Initializing Express, Express-Session, and DotEnv
require('dotenv').config({});	
const express = require('express');					// For reading environment variables
const session = require('express-session');			// For saving session data
const fingerprint = require('express-fingerprint');	// For generating Fingerprint hashes for OS identification
// : Middleware necessary for Express to run
const body_parser = require('body-parser');
const parseurl = require('parseurl');
const helmet = require('helmet');	// Secures Express APIs by defining various HTTP headers
const cors = require('cors');		// Allows for Cross-Origin Resource Sharing - configures Express to add headers stating that your API accepts requests coming from other origins
const https = require('https');

// --------------------------------------------
// --- EXPRESS SETUP
// --------------------------------------------
const app = express();	// Express app
const PORT = process.env.PORT || 8003;
const SESSION_SECRET = process.env.SESSION_SECRET;
const HTTPS_KEY = process.env.HTTPS_KEY;
const HTTPS_CERT = process.env.HTTPS_CERT;

// : Setting up Session cookies with Express
var session_options = {
	secret: SESSION_SECRET,   // MUST BE CHANGED PRIOR TO PRODUCTION
	resave: true,
	saveUninitialized: false,
	cookie: {
		secure: true,
		httpOnly: true,	
		maxAge: 1000 * 60 * 60 * 30,	// One Month
		sameSite: true,
	}
};

// --------------------------------------------
// --- MIDDLEWARE SETUP
// --------------------------------------------
// : Setting up middleware for body_parser
app.use(body_parser.urlencoded({extended:false}));
app.use(body_parser.json());
// : Adding Helmet to enhance our app's API security
app.use(helmet());
// : Enabling CORS for all requests
app.use(cors());
// : Setting up Session middlware
app.use(session(session_options));
// : Setting up HTTPS options
var httpsOptions = {
	key: fs.readFileSync(path.resolve(__dirname, HTTPS_KEY)),
	cert: fs.readFileSync(path.resolve(__dirname, HTTPS_CERT))
}
// : Setting up ability to generate Fingerprint hashes for device identification
app.use(fingerprint({
    parameters:[
        // Defaults
        fingerprint.useragent,
        fingerprint.acceptHeaders,
        fingerprint.geoip,
        // Additional parameters
        function(next) {
            // ...do something...
            next(null,{
            'param1':'value1'
            })
        },
        function(next) {
            // ...do something...
            next(null,{
            'param2':'value2'
            })
        },
    ]
}));
// : Setting up View middlware
app.use(express.static(path.join(__dirname,'../public')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');


app.get('/',(request,response,next)=>{
	return response.render('index');
})

const server = https.createServer(httpsOptions, app).listen(PORT, ()=>{
	console.log("Liquify Sandbox: Listening in on port #"+PORT);
});