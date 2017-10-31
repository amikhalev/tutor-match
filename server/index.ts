import * as express from 'express';
import { Passport } from 'passport';
import { Connection } from 'typeorm';

import * as config from './config';
import createRouter from './router';

async function createApp(connection: Connection) {
    const app = express();
    const passport = new Passport();

    await config.configureExpress(app, connection);
    config.configureAuth(app, passport, connection);

    const router = await createRouter(connection);
    app.use(router);

    return { app, passport, connection };
}

export { config, createApp };
