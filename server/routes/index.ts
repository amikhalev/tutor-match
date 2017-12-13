import { RequestHandler, Router } from 'express';

import { ensureLoggedIn } from '../config/auth';
import { TutorSession, User, UserRole } from '../entities';
import { getNameForUserRole } from '../entities/User';
import { AppError, ForbiddenError, NotFoundError } from '../errors';
import { Repositories } from '../repositories';

import { parseSessionFilters } from '../../common/sessionFilters';

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

    const { users, tutorSessions } = repositories;

    router.get(nav.home.href, ensureLoggedIn(nav.home.minimumRole), (req, res) => {
        console.log('user: ', req.user && req.user.displayName);
        res.render('index', nav.locals(req));
    });

    router.param('tutor_session', (req, res, next, value) => {
        tutorSessions.findOneById(value, { relations: ['tutor', 'students'] })
            .then(session => {
                if (session) {
                    req.tutorSession = session;
                    next();
                } else {
                    throw new NotFoundError({ resourceType: 'TutorSession', resource: value });
                }
            })
            .catch(err => next(err));
    });

    router.param('user_id', (req, res, next, value) => {
        users.findOneById(value).then(theuser => {
            if (theuser) {
                req.targetUser = theuser;
                next();
            } else {
                throw new NotFoundError({ resourceType: 'User', resource: value });
            }
        })
            .catch(err => next(err));
    });

    router.get(nav.tutorSessions.href, ensureLoggedIn(nav.tutorSessions.minimumRole), (req, res, next) => {
        const filters = parseSessionFilters(req.query, req.user);
        // console.log('filters: ', filters);
        tutorSessions.findSessionsFiltered(filters)
            .then(sessions => {
                res.render('tutor_sessions', {
                    ...nav.locals(req), query: req.query, sessions,
                });
            }).catch(next);
    });

    router.get('/profile/:user_id', (req, res) => {
        res.render('profile', { ...nav.locals(req), theUser: req.targetUser });
    });

    function checkCanModifyUser(): RequestHandler {
        return (req, res, next) => {
            const { user, targetUser } = req;
            if (!targetUser!.userCanModify(user)) {
                throw new ForbiddenError({
                    message: `You do not have permission to edit user id ${targetUser!.id}`,
                    targetUser: targetUser!.id,
                    user: user.id,
                    role: user.role,
                });
            }
            next();
        };
    }

    function checkCanModifyTutorSession(): RequestHandler {
        return (req, res, next) => {
            const { user, tutorSession } = req;
            if (!tutorSession!.userCanModify(user)) {
                throw new ForbiddenError({
                    message: `You do not have permission to edit tutor session id ${tutorSession!.id}`,
                    targetUser: tutorSession!.id,
                    user: user.id,
                    role: user.role,
                });
            }
            next();
        };
    }

    router.post('/profile/:user_id/edit', ensureLoggedIn(UserRole.None), checkCanModifyUser(), (req, res, next) => {
        req.targetUser!.updateFromData(req.body, req.user);
        users.save(req.targetUser!)
            .then(() => {
                res.redirect(req.targetUser!.url);
                next();
            }).catch(next);
    });

    router.get('/profile/:user_id/edit', ensureLoggedIn(UserRole.None), checkCanModifyUser(), (req, res) => {
        res.render('profile_edit', { ...nav.locals(req), theUser: req.targetUser, getNameForUserRole });
    });

    router.post(nav.tutorSessions.href, ensureLoggedIn(UserRole.Tutor), (req, res, next) => {
        const tutorSession = TutorSession.parseFormData(req.body);
        tutorSession.tutor = req.user;
        tutorSessions.save(tutorSession)
            .then(newSession => {
                res.redirect(nav.tutorSessions.href + '/' + newSession.id);
            }).catch(next);
    });

    router.get(nav.signUpToTutor.href,
        ensureLoggedIn(nav.signUpToTutor.minimumRole), (req, res) => {
            const session = TutorSession.newSessionData(req.user);
            res.render('new_tutor_session', { ...nav.locals(req), session });
        });

    router.get(nav.tutorSessions.href + '/:tutor_session',
        ensureLoggedIn(nav.tutorSessions.minimumRole), (req, res) => {
            const session = req.tutorSession!;
            res.render('tutor_session', { ...nav.locals(req), title: session.title, session });
        });

    router.get(nav.tutorSessions.href + '/:tutor_session/edit',
        ensureLoggedIn(), checkCanModifyTutorSession(), (req, res, next) => {
            const session = req.tutorSession!;
            res.render('edit_tutor_session', { ...nav.locals(req), title: 'Editing ' + session.title, session });
        });

    router.post(nav.tutorSessions.href + '/:tutor_session/edit',
        ensureLoggedIn(), checkCanModifyTutorSession(), (req, res, next) => {
            let session = req.tutorSession!;
            session = TutorSession.parseFormData(req.body, session);
            tutorSessions.save(session)
                .then(() => {
                    res.redirect(session.url);
                }).catch(next);
        });

    router.post(nav.tutorSessions.href + '/:tutor_session/sign_up',
        ensureLoggedIn(UserRole.Student), (req, res, next) => {
            const session = req.tutorSession!;
            session.students!.push(req.user);
            repositories.tutorSessions.save(session)
                .then(() => { res.redirect(session.url); })
                .catch(next);
        });

    router.post(nav.tutorSessions.href + '/:tutor_session/sign_up_cancel',
        ensureLoggedIn(UserRole.Student), (req, res, next) => {
            const session = req.tutorSession!;
            const sessionIdx = session.students!.findIndex(student => student.id === req.user.id);
            if (sessionIdx === -1) {
                throw new AppError({
                    message: 'You are not signed up for this session',
                    httpStatus: 400, user: req.user.id, session: session.id,
                });
            }
            session.students!.splice(sessionIdx, 1);
            repositories.tutorSessions.save(session)
                .then(() => { res.redirect(req.header('Referrer') || session.url); })
                .catch(next);
        });

    router.post(nav.tutorSessions.href + '/:tutor_session/cancel',
        ensureLoggedIn(UserRole.Student), checkCanModifyTutorSession(), (req, res, next) => {
            const session = req.tutorSession!;
            if (!session.cancel()) {
                throw new AppError({ httpStatus: 400, message: 'That section has already been cancelled' });
            }
            tutorSessions.save(session)
                .then(() => {
                    res.redirect(session.url);
                }).catch(next);
        });

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
