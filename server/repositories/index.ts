import { Connection, Repository } from 'typeorm';

import * as e from '../entities';

import { UserRepository } from './UserRepository';

class Repositories {
    connection: Connection;
    users: UserRepository;
    tutorSessions: Repository<e.TutorSession>;

    constructor(connection: Connection) {
        this.connection = connection;
        this.users = connection.getCustomRepository(UserRepository);
        this.tutorSessions = connection.getRepository(e.TutorSession);
    }
}

export { UserRepository, Repositories };
