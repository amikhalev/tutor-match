import * as express from 'express';
import { Passport } from 'passport';
import { Connection } from 'typeorm';

import * as config from './config';
import { Repositories } from './repositories';
import { configureRoutes } from './routes';

async function createApp(connection: Connection) {
    const repositories = new Repositories(connection);

    const app = express();
    const passport = new Passport();

    await config.configureExpress(app, connection);
    config.configureAuth(app, passport, repositories);

    await configureRoutes(app, repositories);

    return { app, passport, connection };
}

export { config, createApp };
