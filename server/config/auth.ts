import { Express } from 'express';
import * as Passport from 'passport';
import { OAuth2Strategy as PassportGoogleStrategy } from 'passport-google-oauth';
import { Connection } from 'typeorm';

import { User } from '../entities';
import * as env from '../env';

let _passport: Passport.Passport | null = null;

const urls = {
    LOGOUT: '/logout',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
};

const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/plus.login'];

function configureAuth(app: Express, passport: Passport.Passport, connection: Connection) {
    _passport = passport;

    passport.use('google', new PassportGoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.getBaseUri() + urls.GOOGLE_CALLBACK,
    }, async (accessToken, refreshToken, profile: Passport.Profile, done) => {
        console.log(`logging in user id=${profile.id}, name="${profile.displayName}"`);
        let user: User | undefined;
        try {
            user = await connection.manager.findOne(User, { where: { googleId: profile.id } });
        } catch (e) {
            return done(e);
        }
        if (!user) {
            user = new User();
        }
        user.googleId = profile.id;
        user.displayName = profile.displayName;
        user.givenName = profile.name ? profile.name.givenName : '';
        user.familyName = profile.name ? profile.name.familyName : '';
        try {
            await connection.manager.save(user);
            done(null, user);
        } catch (e) {
            done(e);
        }
    }));

    passport.serializeUser(async (user: User, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await connection.manager.findOneById(User, id);
            done(null, user);
        } catch (e) {
            done(e);
        }
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.get(urls.GOOGLE,
        passport.authenticate('google', { scope: GOOGLE_SCOPES }));

    app.get(urls.GOOGLE_CALLBACK,
        passport.authenticate('google', { failureRedirect: '/' }),
        (req, res) => {
            res.redirect('/');
        });

    app.get(urls.LOGOUT, (req, res) => {
        req.logout();
        res.redirect('/');
    });
}

const authenticate = () => _passport!.authenticate('google');

export { configureAuth, authenticate };
