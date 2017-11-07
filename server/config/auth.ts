import * as Express from 'express';
import * as Passport from 'passport';
import { OAuth2Strategy as PassportGoogleStrategy } from 'passport-google-oauth';

import { User, UserRole } from '../entities';
import * as env from '../env';
import { Repositories } from '../repositories';

const urls = {
    LOGOUT: '/logout',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
};

const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/plus.login', 'email'];

function configureAuth(app: Express.Express, passport: Passport.Passport, repositories: Repositories) {

    const { users } = repositories;

    passport.use('google', new PassportGoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.getPublicUri() + urls.GOOGLE_CALLBACK,
    }, (accessToken, refreshToken, profile: Passport.Profile, done) => {
        console.log(`logging in user id=${profile.id}, name="${profile.displayName}", domain=${(profile as any)._json.domain}`);
        users.verifyUser(profile)
            .then(user => done(null, user), err => done(err));
    }));

    passport.serializeUser((user: User, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id: number, done) => {
        users.findOneById(id)
            .then(user => done(null, user), err => done(err));
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.get(urls.GOOGLE,
        passport.authenticate('google', { scope: GOOGLE_SCOPES }));

    function saveSessionAndRedirect(to: string = '/'): Express.RequestHandler {
        return (req, res, next) => {
            if (req.session) {
                req.session.save(err => {
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

function hasRole(req: Express.Request, minimumRole: UserRole): boolean {
    return minimumRole === UserRole.None ||
        (req.isAuthenticated() && (req.user as User).role >= minimumRole);
}

function ensureLoggedIn(minimumRole: UserRole = UserRole.Student, redirectPage: string = '/'): Express.RequestHandler {
    return (req, res, next) => {
        if (hasRole(req, minimumRole)) {
            next();
        } else {
            return res.redirect(redirectPage);
        }
    };
}

export { configureAuth, hasRole, ensureLoggedIn };
