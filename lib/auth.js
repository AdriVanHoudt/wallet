'use strict';

const Fs = require('fs');

const Readline = require('readline');
const GoogleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs.json';

exports.authorize = callback => {
    // Load client secrets from a local file.
    return Fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            return callback(err);
        }

        // Authorize a client with the loaded credentials, then call the
        // Google Sheets API.
        return authorize(JSON.parse(content), callback);
    });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new GoogleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    return Fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            return getNewToken(oauth2Client, callback);
        }

        oauth2Client.credentials = JSON.parse(token);

        return callback(null, oauth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 * client.
 */
function getNewToken(oauth2Client, callback) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', // eslint-disable-line camelcase
        scope: SCOPES
    });

    console.log('Authorize this app by visiting this url: ', authUrl);

    const rl = Readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the code from that page here: ', code => {
        rl.close();

        return oauth2Client.getToken(code, (err, token) => {
            if (err) {
                return callback(err);
            }

            oauth2Client.credentials = token;

            return storeToken(token, err => {
                return callback(err, oauth2Client);
            });
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token, callback) {
    return Fs.mkdir(TOKEN_DIR, err => {
        if (err.code !== 'EEXIST') {
            return callback(err);
        }

        console.log('Token stored to ' + TOKEN_PATH);

        return Fs.writeFile(TOKEN_PATH, JSON.stringify(token), callback);
    });
}
