import * as moment from 'moment';
import { AfterLoad, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User, UserRole } from './User';

@Entity()
export class TutorSession {
    static newSessionData(currentUser: User): TutorSession {
        const session = new TutorSession();
        session.startTime = new Date();
        session.durationSeconds = 30 * 60;
        session.tutor = currentUser;
        // session.school = currentUser.defaultSchool // TODO: waiting for this profile key
        session.location = '';
        session.subject = '';
        session.maxStudents = 0;
        return session;
    }

    static parseFormData(data: any, existingSession?: TutorSession): TutorSession {
        const session = existingSession || new TutorSession();
        session.startTime = moment((data.date || session.startTime_date) + ' ' + (data.time || session.startTime_time),
            'L HH:mmA').toDate();
        session.durationMinutes = +(data.durationMinutes || session.durationMinutes || 0);
        session.location = (data.location || session.location || null);
        session.school = (data.school || session.school || null);
        session.subject = (data.subject || session.subject || null);
        session.maxStudents = (data.maxStudents != null) ? +data.maxStudents : session.maxStudents;
        return session;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column('datetime')
    startTime: Date;

    @Column('int')
    durationSeconds: number;

    @ManyToOne(type => User)
    tutor: User | null;

    @Column('varchar', { nullable: true })
    school: string | null;

    @Column('varchar', { nullable: true })
    location: string | null;

    @Column('varchar', { nullable: true })
    subject: string | null;

    @Column('int')
    maxStudents: number = 0;

    @ManyToMany(type => User)
    @JoinTable({ name: 'tutor_session_students' })
    students?: User[];

    studentCount: number;

    get title() {
        return (this.subject) ? `Tutoring session over ${this.subject}` : 'Tutoring session';
    }

    get startTime_date() {
        return moment(this.startTime).format('L');
    }

    get startTime_time() {
        return moment(this.startTime).format('HH:mmA');
    }

    get startTimeCalendar() {
        return moment(this.startTime).calendar(new Date(), {
            lastDay: '[yesterday at] LT',
            sameDay: '[today at] LT',
            nextDay: '[tomorrow at] LT',
            lastWeek: '[last] dddd [at] LT',
            nextWeek: 'dddd [at] LT',
            sameElse: 'L [at] LT',
        });
    }

    get durationHuman() {
        return moment.duration(this.durationSeconds, 'seconds').humanize();
    }

    get durationMinutes() {
        return this.durationSeconds / 60;
    }

    set durationMinutes(minutes: number) {
        this.durationSeconds = minutes * 60;
    }

    get startVerb() {
        return (this.startTime >= new Date()) ? 'Starting' : 'Started';
    }

    get url() {
        return '/tutor_sessions/' + this.id;
    }

    userCanModify(user: User): boolean {
        return (user.role >= UserRole.Teacher) || (!!this.tutor && this.tutor.id === user.id);
    }

    userIsSignedUpFor(user: User): boolean {
        return !!this.students && !!this.students.find(student => student.id === user.id);
    }

    @AfterLoad()
    /* tslint:disable-next-line:no-unused-variable */
    private afterLoad() {
        if (this.students) this.studentCount = this.students.length;
    }
}
