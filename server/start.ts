import * as env from './env';
env.loadDotenv();

import * as http from 'http';
import app = require('.');

const server = new http.Server(app.default);
server.listen(env.getPort(), env.getHostname(), () => {
    console.log(`App listening at ${env.getBaseUri()}`);
});

