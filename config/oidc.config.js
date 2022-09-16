const jwks = require('./jwks.json');
const secureKeys = require('./secureKeys.json');
const User = require("../models/User");

module.exports = {
    clients: [
        {
            client_id: 'foo',
            grant_types: ['implicit'],
            response_types: ['id_token'],
            redirect_uris: ['https://jwt.io'],
            token_endpoint_auth_method: 'none'
        }
    ],
    cookies: {
        keys: secureKeys.keys,
    },
    jwks: jwks
}
