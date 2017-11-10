import { ConnectionOptions, ConnectionOptionsReader, createConnection } from 'typeorm';

import { entities } from '../entities';

async function configureDatabase() {
    const optionsReader = new ConnectionOptionsReader();
    const readOptions = await optionsReader.all();
    const options = {
        ...readOptions[0], entities,
    };

    const connection = await createConnection(options);
    console.log('Database connected');

    return connection;
}

export { configureDatabase };
