import * as Express from 'express';
import * as Passport from 'passport';
import { OAuth2Strategy as PassportGoogleStrategy } from 'passport-google-oauth';
import { Connection } from 'typeorm';

import { User } from '../entities';
import * as env from '../env';
import { UserRepository } from '../repositories/UserRepository';

let _passport: Passport.Passport | null = null;

const urls = {
    LOGOUT: '/logout',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
};

const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/plus.login'];

function configureAuth(app: Express.Express, passport: Passport.Passport, connection: Connection) {
    _passport = passport;

    const users = connection.getCustomRepository(UserRepository);

    passport.use('google', new PassportGoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.getBaseUri() + urls.GOOGLE_CALLBACK,
    }, (accessToken, refreshToken, profile: Passport.Profile, done) => {
        console.log(`logging in user id=${profile.id}, name="${profile.displayName}"`);
        users.verifyUser(profile)
            .then((user) => done(null, user), (err) => done(err));
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

    function saveSessionAndRedirect(to: string = '/'): Express.RequestHandler {
        return (req, res, next) => {
            if (req.session) {
                req.session.save((err) => {
                    if (err) return next(err);
                    res.redirect(to);
                    next(null);
                });
            } else {
                res.redirect(to);
            }
        };
    }

    app.get(urls.GOOGLE_CALLBACK,
        passport.authenticate('google', { failureRedirect: '/' }),
        saveSessionAndRedirect());

    app.get(urls.LOGOUT, (req, res, next) => {
        req.logout(); next(null);
    }, saveSessionAndRedirect());
}

const authenticate = () => _passport!.authenticate('google');

export { configureAuth, authenticate };
