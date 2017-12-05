import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css';
import 'eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker';
import $ from 'jquery';
import moment from 'moment';

declare global {
    interface JQuery {
        datetimepicker(opts: any): this;
    }
}

$(() => {
    $('.session-start-time').datetimepicker({
        icons: {
            time: 'fa fa-clock-o',
            date: 'fa fa-calendar',
            up: 'fa fa-arrow-up',
            down: 'fa fa-arrow-down',
        },
    });
    if (window.location.pathname.indexOf('/new') !== -1) {
        $('.session-start-time input').val(moment().format('L LT'));
    }
});
