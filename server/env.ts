import * as dotenv from 'dotenv';

function loadEnv() {
    dotenv.config();
}

function getPort() {
    return +(process.env.PORT || 8080);
}

function getPublicUri() {
    return process.env.PUBLIC_URI || `http://localhost:${getPort()}`;
}

function getEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Must specify "${name}" environment variable`);
    }
    return value;
}

export { loadEnv, getPort, getPublicUri, getEnv };
