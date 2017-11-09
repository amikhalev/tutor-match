import { Router } from 'express';

import { ensureLoggedIn } from '../config/auth';
import { TutorSession, User, UserRole } from '../entities';
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

    router.param('tutor_session',  (req, res, next, value) => {
        tutorSessions.findOneById(value, { relations: [ 'tutor', 'students' ] })
            .then(session => {
                if (session) {
                    req.tutorSession = session;
                    next();
                } else {
                    res.status(404).send(`tutor_session id "${value}" not found`);
                }
            })
            .catch(err => next(err));
    });

    router.param('user_id', (req, res, next, value) => {
        users.findOneById(value).then( theuser => {
            if (theuser) {
                req.targetUser = theuser;
                next();
            } else {
                res.status(404).send(`profile id "${value}" not found`);
            }
        })
        .catch(err => next(err));
    });

    router.get(nav.tutorSessions.href, ensureLoggedIn(nav.tutorSessions.minimumRole), (req, res, next) => {
        const filters = parseSessionFilters(req.query, req.user);
        console.log('filters: ', filters);
        tutorSessions.findSessionsFiltered(filters)
            .then(sessions => {
                res.render('tutor_sessions', {
                    ...nav.locals(req), query: req.query, sessions,
                });
            }).catch(next);
    });

    router.get('/profile/:user_id', (req, res) => {
        res.render('profile', { ...nav.locals(req), theUser: req.targetUser});
    });

    router.post('/profile/:user_id/edit', ensureLoggedIn(UserRole.Student), (req, res, next) => {
        if (!req.targetUser!.userCanModify(req.user)) {
            res.status(403).send(`You do not have permission to edit user id ${req.targetUser!.id}`);
            return next();
        }
        req.targetUser!.updateFromData(req.body);
        users.save(req.targetUser!)
            .then(() => {
                res.redirect(req.targetUser!.url);
                next();
            }).catch(next);
    });

    router.get('/profile/:user_id/edit', ensureLoggedIn(UserRole.Student), (req, res) => {
        if (!req.targetUser!.userCanModify(req.user)) {
            res.status(403).send(`You do not have permission to edit user id ${req.targetUser!.id}`);
            return;
        }
        res.render('profile_edit', { ...nav.locals(req), theUser: req.targetUser});
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
        ensureLoggedIn(), (req, res, next) => {
            const session = req.tutorSession!;
            if (!session.userCanModify(req.user)) {
                return res.status(403).send('You do not have permission to edit tutor session ' + session.id);
            }
            res.render('edit_tutor_session', { ...nav.locals(req), title: 'Editing ' + session.title , session });
        });

    router.post(nav.tutorSessions.href + '/:tutor_session/edit',
        ensureLoggedIn(), (req, res, next) => {
            let session = req.tutorSession!;
            if (!session.userCanModify(req.user)) {
                return res.status(403).send('You do not have permission to edit tutor session ' + session.id);
            }
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

    router.post(nav.tutorSessions.href + '/:tutor_session/cancel',
        ensureLoggedIn(UserRole.Student), (req, res, next) => {
            const session = req.tutorSession!;
            if (!session.userCanModify(req.user)) {
                return res.status(403).send('You are not permitted to delete TutorSession with id ' + session.id);
            }
            if (!session.cancel()) {
                return res.status(400).send('That section has already been cancelled');
            }
            tutorSessions.save(session)
                .then(() => {
                    res.redirect(session.url);
                }).catch(next);
        });

    return router;
}
export { createRouter };
