import * as dotenv from 'dotenv';
import * as fs from 'fs-extra';
import * as path from 'path';

function loadDotenv() {
    for (const envFile of ['.env.local', '.env']) {
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

function getEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Must specify "${name}" environment variable`);
    }
    return value;
}

export { loadDotenv, getHostname, getPort, getBaseUri, getEnv };
