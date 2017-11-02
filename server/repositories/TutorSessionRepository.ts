import * as Passport from 'passport';
import { EntityRepository, Repository } from 'typeorm';

import { TutorSession } from '../entities/TutorSession';
import { filterTimeRange, TimeRange } from '../timeRange';

@EntityRepository(TutorSession)
export class TutorSessionRepository extends Repository<TutorSession> {
    findSessionsInTimeRange(timeRange: TimeRange) {
        let query = this.createQueryBuilder('session')
            .leftJoinAndSelect('session.tutor', 'tutor')
            .leftJoinAndSelect('session.students', 'students')
            // .where('session.cancelledAt IS NOT NULL');
        query = filterTimeRange(timeRange, query);
        return query.getMany();
    }
}
