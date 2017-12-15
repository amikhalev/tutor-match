import * as moment from 'moment';
import 'moment-timezone';

import timezone from './timezone';

/* moment is super weird through SystemJS, this hack fixes it */
try {
    (moment as any) = (moment as any).default ? (moment as any).default : moment;
} catch (e) { /* ignore */ }

import { TutorSessionJSON, UserJSON } from './json';

/** Filter on calendar dates */
export type DateRangeQuery = ({
    /**
     * null means no filter
     * "this_week" includes days in the same calendar week
     * "today" includes only today
     * "range" is an inclusive range of days
     */
    dateRange: null | 'this_week' | 'today';
}
    | {
        dateRange: 'range';
        /** the starting date of the range */
        startDate: null | string;
        /** the ending date of the range */
        endDate: null | string;
    }) & {
        notStarted: null | boolean;
    };

/** Filter on calendar dates */
export interface DateRange {
    /** the starting date of the range */
    startDate: null | moment.Moment;
    /** the ending date of the range */
    endDate: null | moment.Moment;
}

/** parses a query string into a DateRange (sanitizes and parses dates) */
export function parseDateRange(query: DateRangeQuery): DateRange {
    query = typeof query === 'object' ? query : defaultSessionFiltersQuery;
    let startDate: moment.Moment | null = null;
    let endDate: moment.Moment | null = null;
    const now = moment.tz(timezone);
    const today = now.clone().set({ hour: 0 });
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
                if (query.startDate) startDate = moment.tz(query.startDate, timezone);
                if (query.endDate) endDate = moment.tz(query.endDate, timezone);
                break;
        }
    }
    if (query.notStarted + '' === 'true') {
        if (!startDate || startDate.isBefore(now)) {
            startDate = now;
        }
    }

    return { startDate, endDate };
}

/** Filter on times of day */
export type TimeRangeQuery = {
    /**
     * null means no filter
     * 'morning', 'lunch' and 'after_school' are preset time ranges
     * 'range' is a custom time range
     */
    timeRange: null | 'morning' | 'lunch' | 'after_school';
} |
    {
        timeRange: 'range',
        /** the start time of the time range */
        startTime: null | string,
        /** the end time of the time range */
        endTime: null | string,
    };

/** Filter on times of day */
export interface TimeRange {
    /** the start time of the time range */
    startTime: null | moment.Moment;
    /** the end time of the time range */
    endTime: null | moment.Moment;
}

const TIME_FORMAT = 'HH:mm';

/** parses a time range from a query string */
export function parseTimeRange(query: TimeRangeQuery): TimeRange {
    query = typeof query === 'object' ? query : defaultSessionFiltersQuery;
    let startTime: moment.Moment | null = null;
    let endTime: moment.Moment | null = null;
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
                if (query.startTime) startTime = moment(query.startTime, TIME_FORMAT);
                if (query.endTime) endTime = moment(query.endTime, TIME_FORMAT);
                break;
        }
    }
    return { startTime, endTime };
}

export type SessionFiltersQuery = DateRangeQuery & TimeRangeQuery & {
    /** filters only cancelled (true) or non-cancelled (false) sessions */
    cancelled: null | boolean;
    /** filters only sessions where this user id is tutoring. true filters on current user */
    tutoring: null | boolean | number;
    /** filters only sessions where this user id is attending as a student. true filters on current user */
    attending: null | boolean | number;
    /** filters the subject of a session */
    subject: null | string;
};

export const defaultSessionFiltersQuery: SessionFiltersQuery = {
    dateRange: null,
    startDate: null,
    endDate: null,
    notStarted: true,
    timeRange: null,
    startTime: null,
    endTime: null,
    cancelled: false,
    tutoring: null,
    attending: null,
    subject: null,
};

/** filters that can be applied to a session. if a field is not present, that filter is not applied */
export interface SessionFilters extends DateRange, TimeRange {
    /** filters only cancelled (true) or non-cancelled (false) sessions */
    cancelled: null | boolean;
    /** filters only sessions where this user id is tutoring */
    tutoring: null | number;
    /** filters only sessions where this user id is attending as a student */
    attending: null | number;
    /** filters the subject of a session */
    subject: null | string;
}

function parseBoolean(q: undefined | null | boolean | string): null | boolean {
    if (q == null || q === 'null' || q === '') {
        return null;
    } else if (q === 'true' || q === '1') {
        return true;
    } else if (q === 'false' || q === '0') {
        return false;
    }
    return Boolean(q);
}

function userQuery(q: undefined | null | boolean | number | string, userId?: number): null | number {
    if (q == null) {
        return null;
    } else if ((q === true || q === 'true') && userId != null) {
        return userId;
    } else if (typeof q === 'number') {
        return q;
    }
    const num = Number(q);
    if (!isNaN(num)) {
        return num;
    }
    return null;
}

function normalizeDate(date: undefined | null | string | number | Date): null | string {
    if (!date || date == null) {
        return null;
    }
    if (date instanceof Date) return date.toString();
    if (typeof date === 'number') return new Date(date).toString();
    return new Date(date).toString();
}

function normalizeUser(q: undefined | null | boolean | number | string): null | boolean | number {
    if (q === true || q === 'true') {
        return true;
    } else if (typeof q === 'number') {
        return q;
    }
    return null;
}

const validDateRange: Array<SessionFiltersQuery['dateRange']> = [null, 'this_week', 'today', 'range'];
const validTimeRange: Array<SessionFiltersQuery['timeRange']> =
    [null, 'morning', 'lunch', 'after_school', 'range'];

export function normalizeFiltersQuery(query: any): SessionFiltersQuery {
    for (const key in defaultSessionFiltersQuery) {
        if (!query.hasOwnProperty(key)) {
            query[key] = defaultSessionFiltersQuery[key];
        }
    }
    return {
        dateRange: validDateRange.indexOf(query.dateRange) >= 0 ? query.dateRange : null,
        startDate: query.dateRange === 'range' ? normalizeDate(query.startDate) : null,
        endDate: query.dateRange === 'range' ? normalizeDate(query.endDate) : null,
        notStarted: parseBoolean(query.notStarted),
        timeRange: validTimeRange.indexOf(query.timeRange) >= 0 ? query.timeRange : null,
        startTime: query.timeRange === 'range' ? normalizeDate(query.startTime) : null,
        endTime: query.timeRange === 'range' ? normalizeDate(query.startTime) : null,
        cancelled: parseBoolean(query.cancelled),
        tutoring: normalizeUser(query.tutoring),
        attending: normalizeUser(query.attending),
        subject: typeof query.subject === 'string' ? query.subject : null,
    };
}

export function parseSessionFilters(query: SessionFiltersQuery, currentUserId?: number): SessionFilters {
    query = typeof query === 'object' ? query : defaultSessionFiltersQuery;
    return {
        ...parseDateRange(query),
        ...parseTimeRange(query),
        cancelled: parseBoolean(query.cancelled),
        tutoring: userQuery(query.tutoring, currentUserId),
        attending: userQuery(query.attending, currentUserId),
        subject: (typeof query.subject !== 'string') ? null : query.subject,
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
    return true;
}

export function isMoreSpecific(a: SessionFiltersQuery, b: SessionFiltersQuery): boolean {
    a = normalizeFiltersQuery(a);
    b = normalizeFiltersQuery(b);

    if (a.cancelled != null && a.cancelled !== b.cancelled) return true;
    if (a.notStarted && !b.notStarted) return true;
    if (a.subject != null && a.subject !== b.subject) return true;
    if (a.tutoring != null && a.tutoring !== b.tutoring) return true;

    const aDate = parseDateRange(a);
    const bDate = parseDateRange(b);
    if (aDate.startDate != null && (bDate.startDate == null || aDate.startDate.isAfter(bDate.startDate))) return true;
    if (aDate.endDate != null && (bDate.endDate == null || aDate.endDate.isBefore(bDate.endDate))) return true;
    const aTime = parseTimeRange(a);
    const bTime = parseTimeRange(b);
    if (aTime.startTime != null && (bTime.startTime == null || aTime.startTime.isAfter(bTime.startTime))) return true;
    if (aTime.endTime != null && (bTime.endTime == null || aTime.endTime.isBefore(bTime.endTime))) return true;

    return false;
}
