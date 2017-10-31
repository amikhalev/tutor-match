import { SelectQueryBuilder } from 'typeorm';

export enum TimeRange {
    All = 0, ThisWeek = 1, Today = 2, Last,
}

export function parseTimeRange(timeRange: string | null): TimeRange {
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

export function filterTimeRange<Entity>(timeRange: TimeRange, query: SelectQueryBuilder<Entity>):
    SelectQueryBuilder<Entity> {
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
