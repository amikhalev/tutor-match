import * as moment from 'moment';

/* moment is super weird through SystemJS, this hack fixes it */
try {
    (moment as any) = (moment as any).default ? (moment as any).default : moment;
} catch (e) { /* ignore */ }

import { TutorSessionJSON, UserJSON } from './json';

/** Filter on calendar dates */
export type DateRangeQuery = {
    /**
     * undefined means no filter
     * "this_week" includes days in the same calendar week
     * "today" includes only today
     * "range" is an inclusive range of days
     */
    dateRange?: undefined | 'this_week' | 'today';
}
    | {
        dateRange: 'range';
        /** the starting date of the range */
        startDate?: string;
        /** the ending date of the range */
        endDate?: string;
    };

/** Filter on calendar dates */
export interface DateRange {
    /** the starting date of the range */
    startDate?: moment.Moment;
    /** the ending date of the range */
    endDate?: moment.Moment;
}

/** parses a query string into a DateRange (sanitizes and parses dates) */
export function parseDateRange(query: DateRangeQuery): DateRange {
    query = typeof query === 'object' ? query : {};
    let startDate: moment.Moment | undefined;
    let endDate: moment.Moment | undefined;
    const today = moment({ hour: 0 });
    if (typeof query.dateRange === 'string') {
        query.dateRange = query.dateRange.trim().toLowerCase() as any;
        switch (query.dateRange) {
            case 'this_week':
                startDate = today.clone().day(0);
                endDate = today.clone().day(6);
                break;
            case 'today':
                startDate = today.clone();
                endDate = today.clone().add({ hour: 24 });
                break;
            case 'range':
                if (query.startDate) startDate = moment(query.startDate);
                if (query.endDate) endDate = moment(query.endDate);
                break;
        }
    }
    return { startDate, endDate };
}

/** Filter on times of day */
export type TimeRangeQuery = {
    /**
     * undefined means no filter
     * 'morning', 'lunch' and 'after_school' are preset time ranges
     * 'range' is a custom time range
     */
    timeRange?: undefined | 'morning' | 'lunch' | 'after_school';
} |
    {
        timeRange: 'range',
        /** the start time of the time range */
        startTime?: undefined | string,
        /** the end time of the time range */
        endTime?: undefined | string,
    };

/** Filter on times of day */
export interface TimeRange {
    /** the start time of the time range */
    startTime?: moment.Moment;
    /** the end time of the time range */
    endTime?: moment.Moment;
}

const TIME_FORMAT = 'HH:mm';

/** parses a time range from a query string */
export function parseTimeRange(query: TimeRangeQuery): TimeRange {
    query = typeof query === 'object' ? query : {};
    let startTime: moment.Moment | undefined;
    let endTime: moment.Moment | undefined;
    if (typeof query.timeRange === 'string') {
        query.timeRange = query.timeRange.trim().toLowerCase() as any;
        switch (query.timeRange) {
            case 'morning':
                startTime = moment({ hour: 6 }); endTime = moment({ hour: 11 }); break;
            case 'lunch':
                startTime = moment({ hour: 11 }); endTime = moment({ hour: 13 }); break;
            case 'after_school':
                startTime = moment({ hour: 13 }); endTime = moment({ hour: 17 }); break;
            case 'range':
                startTime = moment(query.startTime, TIME_FORMAT);
                endTime = moment(query.endTime, TIME_FORMAT);
                break;
        }
    }
    return { startTime, endTime };
}

export type SessionFiltersQuery = DateRangeQuery & TimeRangeQuery & {
    /** filters only cancelled (true) or non-cancelled (false) sessions */
    cancelled?: boolean | string;
    /** filters only sessions where this user id is tutoring. true filters on current user */
    tutoring?: boolean | number | string;
    /** filters only sessions where this user id is attending as a student. true filters on current user */
    attending?: boolean | number | string;
    notStarted?: boolean | string;
    /** filters the subject of a session */
    subject?: string;
};

/** filters that can be applied to a session. if a field is not present, that filter is not applied */
export interface SessionFilters extends DateRange, TimeRange {
    /** filters only cancelled (true) or non-cancelled (false) sessions */
    cancelled?: boolean;
    /** filters only sessions where this user id is tutoring */
    tutoring?: number;
    /** filters only sessions where this user id is attending as a student */
    attending?: number;
    notStarted?: boolean;
    /** filters the subject of a session */
    subject?: string;
}

function parseBoolean(q: undefined | boolean | string): undefined | boolean {
    if (q == null || q === '') {
        return undefined;
    } else if (q === 'true' || q === '1') {
        return true;
    } else if (q === 'false' || q === '0') {
        return false;
    }
    return Boolean(q);
}

function userQuery(q: undefined | boolean | number | string, userId?: number): undefined | number {
    if ((q === true || q === 'true') && userId != null) {
        return userId;
    } else if (typeof q === 'number') {
        return q;
    }
    const num = Number(q);
    if (!isNaN(num)) {
        return num;
    }
    return undefined;
}

export function parseSessionFilters(query: SessionFiltersQuery, currentUserId?: number): SessionFilters {
    query = typeof query === 'object' ? query : {};
    return {
        ...parseDateRange(query),
        ...parseTimeRange(query),
        cancelled: parseBoolean(query.cancelled),
        tutoring: userQuery(query.tutoring, currentUserId),
        attending: userQuery(query.attending, currentUserId),
        notStarted: parseBoolean(query.notStarted),
        subject: (typeof query.subject !== 'string') ? undefined : query.subject,
    };
}

export function filterSession(filt: SessionFilters, session: TutorSessionJSON,
                              currentUser: UserJSON | undefined): boolean {
    const startTime = moment(session.startTime);
    if (filt.startDate && startTime.isBefore(filt.startDate)) {
        return false;
    } else if (filt.endDate && startTime.isAfter(filt.endDate)) {
        return false;
    }
    const date = { year: startTime.year(), month: startTime.month(), date: startTime.date() };
    if (filt.startTime && startTime.isBefore(filt.startTime.clone().set(date))) {
        return false;
    } else if (filt.endTime && startTime.isBefore(filt.endTime.clone().set(date))) {
        return false;
    }
    if (filt.cancelled != null && filt.cancelled !== (session.cancelledAt != null)) {
        return false;
    }
    if (filt.tutoring && (!session.tutor || !currentUser || session.tutor.id !== currentUser.id)) {
        return false;
    }
    if (filt.attending && (!session.students || !currentUser ||
        !session.students.some(student => student.id === currentUser.id))) {
        return false;
    }
    if (filt.notStarted && (new Date(session.startTime) < new Date())) {
        return false;
    }
    return true;
}
