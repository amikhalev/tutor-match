import { Router } from 'express';

import { ensureLoggedIn } from '../config/auth';
import { TutorSession, UserRole } from '../entities';
import { Repositories } from '../repositories';
import { filterTimeRange, parseTimeRange } from '../timeRange';

import * as nav from './nav';

function createRouter(repositories: Repositories) {
    const router = Router();

    const { tutorSessions } = repositories;

    router.get(nav.home.href, ensureLoggedIn(nav.home.minimumRole), (req, res) => {
        console.log('user: ', req.user && req.user.displayName);
        res.render('index', nav.locals(req));
    });

    router.param('tutor_session',  (req, res, next, value) => {
        tutorSessions.findOneById(value, { relations: [ 'tutor', 'students' ] })
            .then(session => {
                if (session) {
                    (req as any).tutorSession = session;
                    next();
                } else {
                    res.status(404).send(`tutor_session id "${value}" not found`);
                }
            })
            .catch(err => next(err));
    });

    router.get(nav.tutorSessions.href, ensureLoggedIn(nav.tutorSessions.minimumRole), (req, res, next) => {
        const timeRange = parseTimeRange(req.query.timeRange);
        tutorSessions.findSessionsInTimeRange(timeRange)
            .then(sessions => {
                res.render('tutor_sessions', {
                    ...nav.locals(req), timeRange, sessions,
                });
            }).catch(next);
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
        const session = (req as any).tutorSession as TutorSession;
        res.render('tutor_session', { ...nav.locals(req), title: session.title, session });
    });

    router.post(nav.tutorSessions.href + '/:tutor_session/sign_up',
        ensureLoggedIn(UserRole.Student), (req, res, next) => {
            const session = (req as any).tutorSession as TutorSession;
            session.students!.push(req.user);
            repositories.tutorSessions.save(session)
                .then(() => { res.redirect(session.url); })
                .catch(next);
        });

    router.post(nav.tutorSessions.href + '/:tutor_session/cancel',
        ensureLoggedIn(UserRole.Student), (req, res, next) => {
            const session = (req as any).tutorSession as TutorSession;
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
