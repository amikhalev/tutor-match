import $ from 'jquery';
import moment from 'moment';

import * as sessionFilters from '../common/sessionFilters';

$(() => {
    const currentUser = JSON.parse($('body').attr('data-user-data'));

    const filters = {
        dateRange: $('#filter-dateRange'),
        timeRange: $('#filter-timeRange'),
        cancelled: $('#filter-cancelled'),
        tutoring: $('#filter-tutoring'),
        attending: $('#filter-attending'),
        apply: $('#filters-apply'),
        reset: $('#filters-reset'),
    };

    let lastCancelledState;

    function updateLastCancelled() {
        const cancelled = filters.cancelled[0] as HTMLInputElement;
        lastCancelledState = {
            indeterminate: cancelled.indeterminate,
            checked: cancelled.checked,
        };
    }

    filters.cancelled.on('change', function(this: HTMLInputElement) {
        if (lastCancelledState.indeterminate) {
            this.indeterminate = false;
            this.checked = true;
        } else if (lastCancelledState.checked) {
            this.checked = false;
        } else {
            this.indeterminate = true;
        }
        updateLastCancelled();
    });

    function resetFilters() {
        filters.dateRange.val('all');
        filters.timeRange.val('all');
        filters.cancelled.prop('indeterminate', true);
        filters.tutoring.prop('checked', false);
        filters.attending.prop('checked', false);
    }

    interface FilterData {
        dateRange: 'all' | 'today' | 'this_week';
        timeRange: 'all' | 'morning' | 'lunch' | 'after_school';
        cancelled: undefined | boolean;
        tutoring: boolean;
        attending: boolean;
    }

    interface SessionData {
        startTime: string;
        cancelledAt?: string;
        tutor: any;
        students: any[];
    }

    function getFilterData(): FilterData {
        return {
            dateRange: filters.dateRange.val() as any,
            timeRange: filters.timeRange.val() as any,
            cancelled: filters.cancelled.prop('indeterminate') ? undefined : filters.cancelled.prop('checked'),
            tutoring: filters.tutoring.prop('checked'),
            attending: filters.attending.prop('checked'),
        };
    }

    function getSessionData(session: JQuery): SessionData {
        const data = session.attr('data-session-data');
        if (data) {
            return JSON.parse(data);
        }
    }

    function shouldShowSession(filterData: FilterData, session: SessionData): boolean {
        const today = moment({hour: 0});
        const startTime = moment(session.startTime);
        switch (filterData.dateRange) {
            case 'today':
                if (!startTime.isBetween(today, today.clone().add({day: 1}))) {
                    return false;
                }
                break;
            case 'this_week':
                const weekStart = today.clone().set({weekday: 0});
                const weekEnd = today.clone().set({weekday: 7});
                if (!startTime.isBetween(weekStart, weekEnd)) {
                    return false;
                }
                break;
        }
        switch (filterData.timeRange) {
            case 'morning':
                if (!startTime.isBetween(startTime.clone().set({hour: 6}),
                        startTime.clone().set({hour: 10}))) {
                    return false;
                }
                break;
            case 'lunch':
                if (!startTime.isBetween(startTime.clone().set({hour: 11}),
                        startTime.clone().set({hour: 1}))) {
                    return false;
                }
                break;
            case 'after_school':
                if (!startTime.isBetween(startTime.clone().set({hour: 14}),
                        startTime.clone().set({hour: 16}))) {
                    return false;
                }
                break;
        }
        if (filterData.cancelled != null && filterData.cancelled !== (session.cancelledAt != null)) {
            return false;
        }
        if (filterData.tutoring && (!session.tutor || !currentUser || session.tutor.id !== currentUser.id)) {
            return false;
        }
        if (filterData.attending && (!session.students || !currentUser ||
                !session.students.some(student => student.id === currentUser.id))) {
            return false;
        }
        return true;
    }

    function applyFilters() {
        const filterData = getFilterData();
        $('.tutor-session').each(function() {
            const session = $(this);
            const data = getSessionData(session);
            const show = shouldShowSession(filterData, data);
            if (show) {
                session.parent().show();
            } else {
                session.parent().hide();
            }
        });
    }

    filters.reset.click(resetFilters);
    filters.apply.click(e => {
        applyFilters();
        e.preventDefault();
    });

    resetFilters();
    applyFilters();
    updateLastCancelled();
});
