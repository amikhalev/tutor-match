import * as dotenv from 'dotenv';
import * as fs from 'fs-extra';
import * as path from 'path';

function loadDotenv() {
    for (const envFile of ['.env', '.env.local']) {
        const file = path.resolve(envFile);
        if (fs.pathExistsSync(file)) {
            dotenv.config({ path: file });
        }
    }
}

function getHostname() {
    return process.env.HOST || 'localhost';
}

function getPort() {
    return +(process.env.PORT || 8080);
}

function getBaseUri() {
    return `http://${getHostname()}:${getPort()}`;
}

export { loadDotenv, getHostname, getPort, getBaseUri };
