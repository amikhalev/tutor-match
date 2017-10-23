import * as path from 'path';
import * as express from 'express';
import { Passport } from 'passport';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';

import router from './router';
import * as auth from './auth';

const app = express();
const passport = new Passport();

app.set('view engine', 'pug');
app.set('views', path.resolve('views'));
app.use('/static/bootstrap', express.static(path.resolve('node_modules', 'bootstrap', 'dist')));
app.use('/static/', express.static(path.resolve('static')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: process.env.SESSION_COOKIE,
    resave: false,
    saveUninitialized: true,
}));

auth.configure(app, passport);

app.use(router)

export default app;
