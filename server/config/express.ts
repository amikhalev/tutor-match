import * as path from 'path';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as MySQLStore from 'express-mysql-session';
import * as session from 'express-session';
import { Connection } from 'typeorm';
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';

import { getEnv } from '../env';

async function configureExpress(app: express.Express, connection: Connection) {
    app.set('view engine', 'pug');
    app.set('views', path.resolve('views'));
    const prod = process.env.NODE_ENV === 'production';
    app.use('/static/', express.static(path.resolve('static'), {
        immutable: prod, maxAge: (prod ? 60 * 60 * 1000 : 0),
    }));
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
