import { Connection } from 'typeorm';

import * as e from '../entities';

async function createMockData(connection: Connection) {
    const alex = await connection.manager.findOne(e.User, { where: { googleId: '114433030556376658316' } });

    await connection.manager.delete(e.TutorSession, {});
    for (let i = 1; i < 10; i++) {
        const session = new e.TutorSession();
        session.id = i;
        session.startTime = new Date(2017, 9, 20 + i, 12, 1 + i);
        session.durationSeconds = 1800 + 30 * i;
        session.tutor = (i % 3 === 0) ? null : alex || null;
        session.subject = ['Calculus', 'History', null][i % 3];
        await connection.manager.save(session);
    }
}

export default createMockData;
