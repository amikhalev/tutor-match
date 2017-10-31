/* tslint:disable:ordered-imports */
import 'reflect-metadata';

// uses import = require syntax so it is loaded before app
import env = require('./env');
env.loadEnv();

import * as http from 'http';
import { config, createApp } from './';

async function start() {
    const connection = await config.configureDatabase();

    if (process.env.NODE_ENV === 'development') {
        console.log('Inserting mock data');
        await config.createMockData(connection);
    }

    const { app } = await createApp(connection);

    const server = new http.Server(app);
    server.listen(env.getPort(), () => {
        console.log(`App listening at ${env.getPublicUri()}`);
    });
}

start().catch(e => {
        console.error('Error starting app: ', e);
    });
