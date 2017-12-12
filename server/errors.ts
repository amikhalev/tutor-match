import { capitalize } from 'lodash';

export enum ErrorType {
    Program
}

export class AppError<T = any> extends Error {
    name = "AppError";
    httpStatus: number;
    errorView: string;
    cause: Error | undefined;

    constructor(message?: string, httpStatus: number = 500, errorView: string = "error", cause?: Error) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorView = errorView;
        this.cause = cause;
    }

    toJSON() {
        return { type: "error", httpStatus: this.httpStatus, message: this.message, cause: this.cause };
    }

    toString() {
        let text = `${this.name}: ${this.message}\n`;
        if (process.env.NODE_ENV === "development") {
            text += "Stacktrace: " + this.stack + "\n";
            if (this.cause) {
                text += "Cause: " + this.cause + "\n";
            }
        }
        return text;
    }
}

export class NotFoundError<T = any> extends AppError {
    name = "NotFoundError";
    resourceType: string;
    resource: string | undefined;

    constructor(resourceType: string = "page", resource?: string, cause?: Error) {
        super(`${capitalize(resourceType)} not found` + (resource ? ': ' + resource : ''), 404, "error", cause);
        this.resourceType = resourceType;
        this.resource = resource;
    }
}
