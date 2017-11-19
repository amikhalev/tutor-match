import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm';

import { TutorSession } from '../entities/TutorSession';

import { DateRange, SessionFilters, TimeRange } from '../../common/sessionFilters';

function filterDateRange(dateRange: DateRange, query: SelectQueryBuilder<TutorSession>) {
    if (dateRange.startDate) {
        query.andWhere('session.startTime >= :startDate', { startDate: dateRange.startDate.toISOString() });
    }
    if (dateRange.endDate) {
        query.andWhere('session.startTime <= :endDate', { endDate: dateRange.endDate.toISOString() });
    }
}

const SQL_TIME_FORMAT = 'HH:mm';

function filterTimeRange(timeRange: TimeRange, query: SelectQueryBuilder<TutorSession>) {
    if (timeRange.startTime) {
        query.andWhere('TIME(session.startTime) >= TIME(:startTime)', {
            startTime: timeRange.startTime.format(SQL_TIME_FORMAT),
        });
    }
    if (timeRange.endTime) {
        return query.andWhere('TIME(session.startTime) <= TIME(:endTime)',
            {
                endTime: timeRange.endTime.format(SQL_TIME_FORMAT),
            });
    }
}

function filterSession(filters: SessionFilters, query: SelectQueryBuilder<TutorSession>) {
    if (filters.cancelled != null) {
        query.andWhere('session.cancelledAt IS ' + (filters.cancelled ? 'NOT NULL' : 'NULL'));
    }
    if (filters.tutoring != null) {
        query.innerJoinAndSelect('session.tutor', 'tutor');
        query.andWhere('tutor.id = :tutoring', { tutoring: filters.tutoring });
    } else {
        query.leftJoinAndSelect('session.tutor', 'tutor');
    }
    if (filters.attending != null) {
        query.innerJoinAndSelect('session.students', 'students');
        query.andWhere('students.id = :attending', { attending: filters.attending });
    } else {
        query.leftJoinAndSelect('session.students', 'students');
    }
    if (filters.subject != null) {
        query.andWhere('session.subject LIKE :subject', { subject: filters.subject });
    }
    query.orderBy('session.startTime');
}

@EntityRepository(TutorSession)
export class TutorSessionRepository extends Repository<TutorSession> {
    findSessionsFiltered(filters: SessionFilters) {
        const query = this.createQueryBuilder('session');
        filterDateRange(filters, query);
        filterTimeRange(filters, query);
        filterSession(filters, query);
        // query.printSql();
        return query.getMany();
    }
}
