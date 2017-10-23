import * as env from './env';

import { Express } from 'express';
import * as Passport from 'passport';
const PassportGoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

let _passport: Passport.Passport | null = null;

const Urls = {
    LOGOUT: '/logout',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
}

const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/plus.login']; 

function configure(app: Express, passport: Passport.Passport) {
    _passport = passport;

    passport.use('google', new PassportGoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.getBaseUri() + Urls.GOOGLE_CALLBACK,
    }, (accessToken, refreshToken, profile, done) => {
        console.log('verifying user: ' + profile.displayName);
        done(null, profile);
    }));
    
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    app.use(passport.initialize());
    app.use(passport.session());
    
    app.get(Urls.GOOGLE,
        passport.authenticate('google', { scope: GOOGLE_SCOPES }));
    
    app.get(Urls.GOOGLE_CALLBACK,
        passport.authenticate('google', { failureRedirect: '/' }),
        (req, res) => {
            res.redirect('/');
        });
    
    app.get(Urls.LOGOUT, (req, res) => {
        req.logout();
        res.redirect('/');
    })
}

const authenticate = () => _passport!.authenticate('google');

export { configure, authenticate };
