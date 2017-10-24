import * as express from 'express';
import { Passport } from 'passport';

import * as config from './config';
import router from './router';

async function createApp() {
    const app = express();
    const passport = new Passport();

    const connection = await config.configureDatabase();
    await config.configureExpress(app, connection);
    config.configureAuth(app, passport, connection);

    app.use(router);

    return { app, passport, connection };
}

export default createApp;
