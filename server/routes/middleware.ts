import { RequestHandler } from 'express';

import { ensureLoggedIn } from '../config/auth';
import { ForbiddenError } from '../errors';

export { ensureLoggedIn };

export function checkCanModifyUser(): RequestHandler {
    return (req, res, next) => {
        const { user, targetUser } = req;
        if (!targetUser!.userCanModify(user)) {
            throw new ForbiddenError({
                message: `You do not have permission to edit user id ${targetUser!.id}`,
                targetUser: targetUser!.id,
                user: user.id,
                role: user.role,
            });
        }
        next();
    };
}

export function checkCanModifyTutorSession(): RequestHandler {
    return (req, res, next) => {
        const { user, tutorSession } = req;
        if (!tutorSession!.userCanModify(user)) {
            throw new ForbiddenError({
                message: `You do not have permission to edit tutor session id ${tutorSession!.id}`,
                targetUser: tutorSession!.id,
                user: user.id,
                role: user.role,
            });
        }
        next();
    };
}
