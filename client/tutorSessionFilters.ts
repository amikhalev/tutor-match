import $ from 'jquery';

import { TutorSessionJSON, UserJSON } from '../common/json';
import {
    defaultSessionFiltersQuery, filterSession, isMoreSpecific, normalizeFiltersQuery, parseSessionFilters,
    SessionFiltersQuery,
} from '../common/sessionFilters';

$(() => {
    const filtersEl = $('.tutor-session-filters');
    const currentUser: UserJSON | null = JSON.parse($('body').attr('data-user-data'));
    const serverFilters: SessionFiltersQuery = JSON.parse(filtersEl.attr('data-server-filters'));

    const filterEls = {
        dateRange: $('#filter-dateRange'),
        timeRange: $('#filter-timeRange'),
        cancelled: $('#filter-cancelled'),
        tutoring: $('#filter-tutoring'),
        attending: $('#filter-attending'),
        notStarted: $('#filter-notStarted'),
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

    function setFiltersQuery(query: SessionFiltersQuery) {
        filterEls.dateRange.val(query.dateRange || 'all');
        filterEls.timeRange.val(query.timeRange || 'all');
        if (query.cancelled == null) {
            filterEls.cancelled.prop('indeterminate', true);
        } else if (query.cancelled) {
            filterEls.cancelled.prop('checked', true);
        } else {
            filterEls.cancelled.prop('checked', false);
        }
        filterEls.tutoring.prop('checked', query.tutoring);
        filterEls.attending.prop('checked', query.attending);
        filterEls.notStarted.prop('checked', query.notStarted);
    }

    function resetFilters() {
        setFiltersQuery(defaultSessionFiltersQuery);
        applyFilters();
    }

    function getFiltersQuery(): SessionFiltersQuery {
        return normalizeFiltersQuery({
            dateRange: filterEls.dateRange.val() as any,
            timeRange: filterEls.timeRange.val() as any,
            cancelled: filterEls.cancelled.prop('indeterminate') ? null : filterEls.cancelled.prop('checked'),
            tutoring: filterEls.tutoring.prop('checked'),
            attending: filterEls.attending.prop('checked'),
            notStarted: filterEls.notStarted.prop('checked'),
        });
    }

    function getSessionData(session: JQuery): TutorSessionJSON {
        const data = session.attr('data-session-data');
        if (data) {
            return JSON.parse(data);
        }
    }

    function applyFilters(allowNavigate: boolean = true) {
        const query = getFiltersQuery();
        for (const key in query) {
            if (query[key] === defaultSessionFiltersQuery[key]) {
                delete query[key];
            }
        }
        const filterData = parseSessionFilters(query, currentUser.id);
        const newLocation = location.protocol + '//' + location.host + location.pathname + '?' + $.param(query);
        if (isMoreSpecific(serverFilters, query) && allowNavigate) {
            window.location.assign(newLocation);
        } else {
            window.history.pushState({}, document.title, newLocation);
        }
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

    setFiltersQuery(serverFilters);
    applyFilters(false);
    updateLastCancelled();
});
