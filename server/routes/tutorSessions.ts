import { Router } from 'express';

import { parseSessionFilters } from '../../common/sessionFilters';
import { TutorSession, UserRole } from '../entities';
import { AppError, NotFoundError } from '../errors';
import { Repositories } from '../repositories';

import { checkCanModifyTutorSession, ensureLoggedIn } from './middleware';
import * as nav from './nav';

function createRouter(repositories: Repositories) {
    const { tutorSessions } = repositories;

    const router = Router();

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

    router.get('/', ensureLoggedIn(nav.tutorSessions.minimumRole), (req, res, next) => {
        const filters = parseSessionFilters(req.query, req.user);
        // console.log('filters: ', filters);
        tutorSessions.findSessionsFiltered(filters)
            .then(sessions => {
                res.render('tutor_sessions', {
                    ...nav.locals(req), query: req.query, sessions,
                });
            }).catch(next);
    });

    router.post('/', ensureLoggedIn(UserRole.Tutor), (req, res, next) => {
        const tutorSession = TutorSession.parseFormData(req.body);
        tutorSession.tutor = req.user;
        tutorSessions.save(tutorSession)
            .then(newSession => {
                res.redirect('/' + newSession.id);
            }).catch(next);
    });

    router.get('/new',
        ensureLoggedIn(nav.signUpToTutor.minimumRole), (req, res) => {
            const session = TutorSession.newSessionData(req.user);
            res.render('new_tutor_session', { ...nav.locals(req), session });
        });

    router.get('/:tutor_session',
        ensureLoggedIn(nav.tutorSessions.minimumRole), (req, res) => {
            const session = req.tutorSession!;
            res.render('tutor_session', { ...nav.locals(req), title: session.title, session });
        });

    router.get('/:tutor_session/edit',
        ensureLoggedIn(), checkCanModifyTutorSession(), (req, res, next) => {
            const session = req.tutorSession!;
            res.render('edit_tutor_session', { ...nav.locals(req), title: 'Editing ' + session.title, session });
        });

    router.post('/:tutor_session/edit',
        ensureLoggedIn(), checkCanModifyTutorSession(), (req, res, next) => {
            let session = req.tutorSession!;
            session = TutorSession.parseFormData(req.body, session);
            tutorSessions.save(session)
                .then(() => {
                    res.redirect(session.url);
                }).catch(next);
        });

    router.post('/:tutor_session/sign_up',
        ensureLoggedIn(UserRole.Student), (req, res, next) => {
            const session = req.tutorSession!;
            session.students!.push(req.user);
            repositories.tutorSessions.save(session)
                .then(() => { res.redirect(session.url); })
                .catch(next);
        });

    router.post('/:tutor_session/sign_up_cancel',
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

    router.post('/:tutor_session/cancel',
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

    return router;
}

export default createRouter;
