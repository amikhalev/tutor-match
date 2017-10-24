/* tslint:disable:ordered-imports */
import 'reflect-metadata';

// uses import = require syntax so it is loaded before app
import env = require('./env');
env.loadDotenv();

import * as http from 'http';
import createApp = require('.');

createApp.default()
    .then(({ app }) => {
        const server = new http.Server(app);
        server.listen(env.getPort(), () => {
            console.log(`App listening at ${env.getBaseUri()}`);
        });
    }).catch((e) => {
        console.error('Error starting app: ', e);
    });
