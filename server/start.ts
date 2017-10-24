import * as http from 'http';

import app = require('.');
import * as env from './env';

const server = new http.Server(app.default);
server.listen(env.getPort(), env.getHostname(), () => {
    console.log(`App listening at ${env.getBaseUri()}`);
});
