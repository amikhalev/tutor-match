import { ConnectionOptions, createConnection } from 'typeorm';

import { entities } from '../entities';
import { getEnv } from '../env';

async function configureDatabase() {
    const options: ConnectionOptions = {
        type: 'mysql',
        url: getEnv('DATABASE_URL'),
        entities,
        synchronize: true,
    };

    const connection = await createConnection(options);
    console.log('Database connected');

    return connection;
}

export { configureDatabase };
