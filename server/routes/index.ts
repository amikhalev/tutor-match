import { Router } from 'express';

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

function createRouter(repositories: Repositories) {
    const router = Router();

    router.get(nav.home.href, ensureLoggedIn(nav.home.minimumRole), (req, res) => {
        console.log('user: ', req.user && req.user.displayName);
        res.render('index', nav.locals(req));
    });

    router.use('/tutor_sessions', createTutorSessions(repositories));
    router.use('/profiles', createProfiles(repositories));

    router.use((req, res, next) => {
        next(new NotFoundError({ resource: req.url }));
    });

    router.use((err, req, res, next) => {
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

    return router;
}
export { createRouter };
