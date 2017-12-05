import $ from 'jquery';
import moment from 'moment';

import { TutorSessionJSON, UserJSON } from '../common/json';
import { filterSession, parseSessionFilters, SessionFilters, SessionFiltersQuery } from '../common/sessionFilters';

$(() => {
    const currentUser: UserJSON | null = JSON.parse($('body').attr('data-user-data'));

    const filterEls = {
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
        const cancelled = filterEls.cancelled[0] as HTMLInputElement;
        lastCancelledState = {
            indeterminate: cancelled.indeterminate,
            checked: cancelled.checked,
        };
    }

    filterEls.cancelled.on('change', function(this: HTMLInputElement) {
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
        filterEls.dateRange.val('all');
        filterEls.timeRange.val('all');
        filterEls.cancelled.prop('indeterminate', true);
        filterEls.tutoring.prop('checked', false);
        filterEls.attending.prop('checked', false);
    }

    function getFiltersQuery(): SessionFiltersQuery {
        return {
            dateRange: filterEls.dateRange.val() as any,
            timeRange: filterEls.timeRange.val() as any,
            cancelled: filterEls.cancelled.prop('indeterminate') ? undefined : filterEls.cancelled.prop('checked'),
            tutoring: filterEls.tutoring.prop('checked'),
            attending: filterEls.attending.prop('checked'),
        };
    }

    function getFilters(): SessionFilters {
        const query = getFiltersQuery();
        return parseSessionFilters(query, currentUser.id);
    }

    function getSessionData(session: JQuery): TutorSessionJSON {
        const data = session.attr('data-session-data');
        if (data) {
            return JSON.parse(data);
        }
    }

    function applyFilters() {
        const filterData = getFilters();
        $('.tutor-session').each(function() {
            const session = $(this);
            const data = getSessionData(session);
            const show = filterSession(filterData, data, currentUser);
            if (show) {
                session.parent().show();
            } else {
                session.parent().hide();
            }
        });
    }

    filterEls.reset.click(resetFilters);
    filterEls.apply.click(e => {
        applyFilters();
        e.preventDefault();
    });

    resetFilters();
    applyFilters();
    updateLastCancelled();
});
