import { Connection } from 'typeorm';

import { SchoolRepository } from './SchoolRepository';
import { TutorSessionRepository } from './TutorSessionRepository';
import { UserRepository } from './UserRepository';

class Repositories {
    connection: Connection;
    users: UserRepository;
    tutorSessions: TutorSessionRepository;
    schools: SchoolRepository;

    constructor(connection: Connection) {
        this.connection = connection;
        this.users = connection.getCustomRepository(UserRepository);
        this.tutorSessions = connection.getCustomRepository(TutorSessionRepository);
        this.schools = connection.getCustomRepository(SchoolRepository);
    }
}

export { UserRepository, Repositories };
