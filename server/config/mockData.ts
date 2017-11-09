import * as moment from 'moment';
import { Connection } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { ObjectType } from 'typeorm/common/ObjectType';

import * as e from '../entities';

async function createMockData(connection: Connection) {
    async function createOrUpdate<Entity extends { id: any }>(
        entityClass: ObjectType<Entity>, entityLike: DeepPartial<Entity> & { id: any }): Promise<Entity> {
        let entity = await connection.manager.preload(entityClass, entityLike);
        if (!entity) {
            entity = await connection.manager.create(entityClass, entityLike);
        }
        await connection.manager.save(entity);
        return (await connection.manager.findOneById(entityClass, entityLike.id))!;
    }

    const alex = await createOrUpdate(e.User,
        { id: 1, googleId: '114433030556376658316', role: e.UserRole.Admin });
    const user2 = await createOrUpdate(e.User,
        { id: 2, role: e.UserRole.Student, displayName: 'User 2' });
    const user3 = await createOrUpdate(e.User,
        { id: 3, role: e.UserRole.Teacher, displayName: 'User 3' });

    const initial = moment().subtract({ days: 5 });
    for (let i = 1; i < 30; i++) {
        const session = new e.TutorSession();
        session.id = i;
        const time = { hour: [8, 12, 15][i % 3], minutes: 10 + i, seconds: 2 * i };
        session.startTime = initial.clone().add({ days: Math.floor(i / 3) }).set(time).toDate();
        session.durationSeconds = (60) * (20 + .5 * ((i + 4) % 10));
        session.tutor = [null, alex, user2, user3, user2][(i + 2) % 5];
        session.school = 'Timberline High School';
        session.location = (i % 2 === 0) ? 'Calculus room' : 'Library';
        session.subject = ['Calculus', 'History', 'Violin'][i % 3];
        session.maxStudents = (i + 1) % 4;
        session.students = [alex, user2, alex, user2].slice(i % 4, (i + 2) % 4);
        session.cancelledAt = (i + 3) % 4 === 0 ? initial.toDate() : null;
        await connection.manager.save(session);
    }
}

export default createMockData;
