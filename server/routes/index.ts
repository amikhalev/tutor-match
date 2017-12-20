import * as express from 'express';

import { ensureLoggedIn } from '../config/auth';
import { TutorSession, User } from '../entities';
import { AppError, NotFoundError } from '../errors';
import { Repositories } from '../repositories';

import createProfiles from './profiles';
import createTutorSessions from './tutorSessions';

import * as nav from './nav';

declare global {
    namespace Express {
        interface Request {
            tutorSession?: TutorSession;
            targetUser?: User;
        }
    }
}

function configureRoutes(app: express.Express, repositories: Repositories) {
    app.locals.NODE_ENV = process.env.NODE_ENV;

    app.get(nav.home.href, ensureLoggedIn(nav.home.minimumRole), (req, res) => {
        console.log('user: ', req.user && req.user.displayName);
        res.render('index', nav.locals(req));
    });

    app.use('/tutor_sessions', createTutorSessions(repositories));
    app.use('/profiles', createProfiles(repositories));

    app.use((req, res, next) => {
        next(new NotFoundError({ resource: req.url }));
    });

    app.use((err, req, res, next) => {
        if (err instanceof AppError) {
            res.status(err.httpStatus);
            if (req.accepts('html')) {
                return res.render(err.errorView, { err });
            }
            if (req.accepts('json')) {
                return res.send(err.toJSON());
            }
            return res.type('text').send(err.toString());
        }
        next(err);
    });
}

export { configureRoutes };
