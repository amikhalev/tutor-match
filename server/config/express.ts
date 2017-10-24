import * as path from 'path';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as session from 'express-session';

import { getEnv } from '../env';

function configureExpress(app: express.Express) {
    app.set('view engine', 'pug');
    app.set('views', path.resolve('views'));
    app.use('/static/bootstrap', express.static(path.resolve('node_modules', 'bootstrap', 'dist')));
    app.use('/static/', express.static(path.resolve('static')));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(session({
        secret: getEnv('SESSION_SECRET'),
        name: process.env.SESSION_COOKIE,
        resave: false,
        saveUninitialized: true,
    }));
}

export { configureExpress };
