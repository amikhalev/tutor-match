import * as express from 'express';
import { Passport } from 'passport';

import * as config from './config';
import createRouter from './router';

async function createApp() {
    const app = express();
    const passport = new Passport();

    const connection = await config.configureDatabase();
    await config.configureExpress(app, connection);
    config.configureAuth(app, passport, connection);

    const router = await createRouter(connection);
    app.use(router);

    if (process.env.NODE_ENV === 'development') {
        console.log('Inserting mock data');
        await config.createMockData(connection);
    }

    return { app, passport, connection };
}

export default createApp;
