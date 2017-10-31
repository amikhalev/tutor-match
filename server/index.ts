import * as express from 'express';
import { Passport } from 'passport';
import { Connection } from 'typeorm';

import * as config from './config';
import { Repositories } from './repositories';
import { createRouter } from './routes';

async function createApp(connection: Connection) {
    const repositories = new Repositories(connection);

    const app = express();
    const passport = new Passport();

    await config.configureExpress(app, connection);
    config.configureAuth(app, passport, repositories);

    const router = await createRouter(repositories);
    app.use(router);

    return { app, passport, connection };
}

export { config, createApp };
