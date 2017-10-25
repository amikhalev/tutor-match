import { Router } from 'express';
import { Connection, SelectQueryBuilder } from 'typeorm';

import * as e from './entities';
import * as nav from './nav';

enum TimeRange {
    All = 0, ThisWeek = 1, Today = 2, Last,
}

function parseTimeRange(timeRange: string | null): TimeRange {
    if (timeRange == null) {
        return TimeRange.All;
    }
    const int = parseInt(timeRange.toString(), 10);
    if (!isNaN(int) && int >= 0 && int <= TimeRange.Last) {
        return int;
    }
    switch (timeRange.toLowerCase()) {
        case 'this_week': return TimeRange.ThisWeek;
        case 'today': return TimeRange.Today;
        default:
        case 'all': return TimeRange.All;
    }
}

function filterTimeRange<Entity>(timeRange: TimeRange, query: SelectQueryBuilder<Entity>): SelectQueryBuilder<Entity> {
    switch (timeRange) {
        case TimeRange.ThisWeek:
            return query.where('WEEK(user.startTime) = WEEK(CURDATE())');
        case TimeRange.Today:
            return query.where('DATE(user.startTime) = CURDATE()');
        default:
        case TimeRange.All:
            return query;
    }
}

function createRouter(connection: Connection) {
    const router = Router();

    const tutorSessions = connection.manager.getRepository(e.TutorSession);

    router.get(nav.home.href, (req, res) => {
        console.log('user: ', req.user && req.user.displayName);
        res.render('index', { ...nav.locals(req), message: 'Hello there!' });
    });

    router.get(nav.tutorSessions.href, (req, res, next) => {
        const timeRange = parseTimeRange(req.query.timeRange);
        const now = new Date();
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

export default createRouter;
