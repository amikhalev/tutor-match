import { capitalize } from 'lodash';

export class AppError extends Error {
    name = "AppError";
    httpStatus: number = 500;
    errorView: string = "error";
    cause: Error | undefined = undefined;
    [key: string]: any;

    constructor(opts?: Partial<AppError>) {
        super(opts && opts.message);
        if (opts) {
            Object.assign(this, opts);
        }
    }

    toJSON() {
        return { type: "error", ...(this as object) };
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
    httpStatus = 404;
    resourceType: string = "page";
    resource: string | undefined = undefined;

    constructor(opts?: Partial<NotFoundError>) {
        super(opts);
        this.message = `${capitalize(this.resourceType)} not found` + (this.resource ? ': ' + this.resource : '');
    }
}
