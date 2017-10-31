import * as moment from 'moment';
import { AfterLoad, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './User';

@Entity()
export class TutorSession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('datetime')
    startTime: Date;

    @Column('int')
    durationSeconds: number;

    @ManyToOne(type => User)
    tutor: User | null;

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

    get startTimeCalendar() {
        return moment(this.startTime).calendar(new Date(), {
            lastDay: '[yesterday at] LT',
            sameDay: '[today at] LT',
            nextDay: '[tomorrow at] LT',
            lastWeek: '[last] dddd [at] LT',
            nextWeek: 'dddd [at] LT',
            sameElse: 'L at LT',
        });
    }

    get durationHuman() {
        return moment.duration(this.durationSeconds, 'seconds').humanize();
    }

    get startVerb() {
        return (this.startTime >= new Date()) ? 'Starting' : 'Started';
    }

    @AfterLoad()
    /* tslint:disable-next-line:no-unused-variable */
    private afterLoad() {
        if (this.students) this.studentCount = this.students.length;
    }
}
