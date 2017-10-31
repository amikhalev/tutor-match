import { Router } from 'express';

import { Repositories } from '../repositories';

import * as nav from './nav';
import { filterTimeRange, parseTimeRange } from './timeRange';

function createRouter(repositories: Repositories) {
    const router = Router();

    const { tutorSessions } = repositories;

    router.get(nav.home.href, (req, res) => {
        console.log('user: ', req.user && req.user.displayName);
        res.render('index', { ...nav.locals(req), message: 'Hello there!' });
    });

    router.get(nav.tutorSessions.href, (req, res, next) => {
        const timeRange = parseTimeRange(req.query.timeRange);
        let query = tutorSessions.createQueryBuilder('session')
            .leftJoinAndSelect('session.tutor', 'tutor')
            .loadRelationCountAndMap('session.studentCount', 'session.students');
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

    return router;
}

export { createRouter };
