import { Router } from 'express';

import { ensureLoggedIn } from '../config/auth';
import { TutorSession, UserRole, User } from '../entities';
import { Repositories } from '../repositories';

import * as nav from './nav';
import { filterTimeRange, parseTimeRange } from './timeRange';

function createRouter(repositories: Repositories) {
    const router = Router();

    const { users, tutorSessions } = repositories;

    router.get(nav.home.href, ensureLoggedIn(nav.home.minimumRole), (req, res) => {
        console.log('user: ', req.user && req.user.displayName);
        res.render('index', nav.locals(req));
    });

    router.param('tutor_session',  (req, res, next, value) => {
        tutorSessions.findOneById(value, { relations: [ 'students' ] })
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

    router.param('user_id', (req, res, next, value) => {
        let userPromise = users.findOneById(value);
        userPromise.then((theuser) => {
            if(theuser) {
                (req as any).targetUser = theuser;
                next();
            } else {
                res.status(404).send(`profile id "${value}" not found`);
            }
        })
        .catch(err => next(err));
    });

    router.get(nav.tutorSessions.href, ensureLoggedIn(nav.tutorSessions.minimumRole), (req, res, next) => {
        const timeRange = parseTimeRange(req.query.timeRange);
        let query = tutorSessions.createQueryBuilder('session')
            .leftJoinAndSelect('session.tutor', 'tutor')
            .leftJoinAndSelect('session.students', 'students');
        query = filterTimeRange(timeRange, query);
        query.getMany()
            .then(sessions => {
                res.render('tutor_sessions', {
                    ...nav.locals(req),
                    timeRange,
                    sessions,
                });
            }).catch(next);
    });

    router.get("/profile/:user_id", (req, res) => {
        res.render('profile', { ...nav.locals(req), theUser: (req as any).targetUser as User});
    });

    router.post("/profile/:user_id/edit", ensureLoggedIn(UserRole.Student), (req, res) => {
        if(req.user.id == ((req as any).targetUser as User).id || req.user.role == UserRole.Admin) {
            if(req.body.bio) {
                req.user.bio = req.body.bio;
            }
            users.save(req.user);
        }
        res.redirect("/");
    });
    router.get("/profile/:user_id/edit", ensureLoggedIn(UserRole.Student), (req, res) => {
        if(nav.locals(req).user.id == ((req as any).targetUser as User).id || nav.locals(req).user.role == UserRole.Admin) {
            res.render('profile_edit', { ...nav.locals(req), theUser: (req as any).targetUser as User});
        } else {
            res.redirect('/');
        }
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

    return router;
}
export { createRouter };
