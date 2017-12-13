import $ from 'jquery';

$('.tutor-session')
    .each(function() {
        const session = $(this);
        const form = session.find('.cancel-sign-up-form');
        session.find('.cancel-sign-up')
            .click(() => {
                form.submit();
            });
    });
