'use strict';

const Google = require('googleapis');

const Auth = require('./auth');

return Auth.authorize((err, client) => {

    if (err) {
        throw err;
    }

    const sheets = Google.sheets({
        version: 'v4',
        auth: client
    });

    console.log(sheets);
});
