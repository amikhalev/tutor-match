import * as path from 'path';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as MySQLStore from 'express-mysql-session';
import * as session from 'express-session';
import { Connection } from 'typeorm';
/* tslint:disable-next-line */
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';

import { getEnv } from '../env';

async function configureExpress(app: express.Express, connection: Connection) {
    app.set('view engine', 'pug');
    app.set('views', path.resolve('views'));
    app.use('/static/jquery', express.static(path.resolve('node_modules', 'jquery', 'dist')));
    app.use('/static/popper.js', express.static(path.resolve('node_modules', 'popper.js', 'dist', 'umd')));
    app.use('/static/bootstrap', express.static(path.resolve('node_modules', 'bootstrap', 'dist')));
    app.use('/static/bootstrap-datepicker', express.static(
        path.resolve('node_modules', 'bootstrap-datepicker', 'dist')));
    app.use('/static/clockpicker', express.static(
        path.resolve('node_modules', 'clockpicker', 'dist')));
    app.use('/static/font-awesome', express.static(path.resolve('node_modules', 'font-awesome')));
    app.use('/static/moment', express.static(path.resolve('node_modules', 'moment')));
    app.use('/static/', express.static(path.resolve('static')));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    const mysqlCon = (connection.driver as MysqlDriver).pool;
    const sessionStore = new (MySQLStore(session))({}, mysqlCon);

    app.use(session({
        secret: getEnv('SESSION_SECRET'),
        name: process.env.SESSION_COOKIE || 'tutormatch.sid',
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
    }));

    return { sessionStore };
}

export { configureExpress };
