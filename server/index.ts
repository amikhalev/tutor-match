import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as session from 'express-session';
import { Passport } from 'passport';
import * as path from 'path';

import * as auth from './auth';
import router from './router';

const app = express();
const passport = new Passport();

app.set('view engine', 'pug');
app.set('views', path.resolve('views'));
app.use('/static/bootstrap', express.static(path.resolve('node_modules', 'bootstrap', 'dist')));
app.use('/static/', express.static(path.resolve('static')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) throw new Error('Must specify SESSION_SECRET environment variable');
app.use(session({
    secret: SESSION_SECRET,
    name: process.env.SESSION_COOKIE,
    resave: false,
    saveUninitialized: true,
}));

auth.configure(app, passport);

app.use(router);

export default app;
