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

const vendors = [
    { routePath: '/vendor/jquery', fsPath: path.resolve('node_modules', 'jquery', 'dist') },
    { routePath: '/vendor/popper.js', fsPath: path.resolve('node_modules', 'popper.js', 'dist', 'umd') },
    { routePath: '/vendor/bootstrap', fsPath: path.resolve('node_modules', 'bootstrap', 'dist') },
    { routePath: '/vendor/clockpicker', fsPath: path.resolve('node_modules', 'clockpicker', 'dist') },
    { routePath: '/vendor/font-awesome', fsPath: path.resolve('node_modules', 'font-awesome') },
    { routePath: '/vendor/moment', fsPath: path.resolve('node_modules', 'moment') },
    { routePath: '/vendor/eonasdan-bootstrap-datetimepicker', fsPath: path.resolve('node_modules',
        'eonasdan-bootstrap-datetimepicker') },
];

async function configureExpress(app: express.Express, connection: Connection) {
    app.set('view engine', 'pug');
    app.set('views', path.resolve('views'));
    app.use('/static/', express.static(path.resolve('static')));
    for (const { routePath, fsPath } of vendors) {
        app.use(routePath, express.static(fsPath));
    }
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
