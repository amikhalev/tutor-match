import { Connection, Repository } from 'typeorm';

import * as e from '../entities';

import { TutorSessionRepository } from './TutorSessionRepository';
import { UserRepository } from './UserRepository';

class Repositories {
    connection: Connection;
    users: UserRepository;
    tutorSessions: TutorSessionRepository;

    constructor(connection: Connection) {
        this.connection = connection;
        this.users = connection.getCustomRepository(UserRepository);
        this.tutorSessions = connection.getCustomRepository(TutorSessionRepository);
    }
}

export { UserRepository, Repositories };
