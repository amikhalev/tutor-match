import { capitalize } from 'lodash';

export class AppError extends Error {
    name = "AppError";
    httpStatus: number = 500;
    errorView: string = "error";
    cause: Error | undefined = undefined;
    [key: string]: any;

    constructor(opts?: Partial<AppError>) {
        super(opts && opts.message);
        this.setOpts(opts);
    }

    protected setOpts(opts?: Partial<AppError>) {
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
    resourceType: string = "Page";
    resource: string | undefined = undefined;

    constructor(opts?: Partial<NotFoundError>) {
        super();
        this.setOpts(opts);
        this.message = `${this.resourceType} not found` + (this.resource ? ': ' + this.resource : '');
    }
}

export class ForbiddenError<T = any> extends AppError {
    name = "ForbiddenError";
    message = "You do not have permission to do that";
    httpStatus = 403;

    constructor(opts?: Partial<ForbiddenError>) {
        super();
        this.setOpts(opts);
    }
}

export class ValidationError<T = any> extends AppError {
    name = "ValidationError";
    message = "The provided request data was invalid";
    httpStatus = 401;

    constructor(opts?: Partial<ValidationError>) {
        super();
        this.setOpts(opts);
    }
}
