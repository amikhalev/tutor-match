import { Router } from 'express';

import { UserRole } from '../entities';
import { getNameForUserRole } from '../entities/User';
import { NotFoundError } from '../errors';
import { Repositories } from '../repositories';

import { checkCanModifyUser, ensureLoggedIn } from './middleware';
import * as nav from './nav';

function createRouter(repositories: Repositories) {
    const { users } = repositories;

    const router = Router();

    router.param('user_id', (req, res, next, value) => {
        users.findOneById(value).then(theuser => {
            if (theuser) {
                req.targetUser = theuser;
                next();
            } else {
                throw new NotFoundError({ resourceType: 'User', resource: value });
            }
        })
            .catch(err => next(err));
    });

    router.get('/:user_id', (req, res) => {
        res.render('profile', { ...nav.locals(req), theUser: req.targetUser });
    });

    router.post('/:user_id/edit', ensureLoggedIn(UserRole.None), checkCanModifyUser(), (req, res, next) => {
        req.targetUser!.updateFromData(req.body, req.user);
        users.save(req.targetUser!)
            .then(() => {
                res.redirect(req.targetUser!.profileUrl);
                next();
            }).catch(next);
    });

    router.get('/:user_id/edit', ensureLoggedIn(UserRole.None), checkCanModifyUser(), (req, res) => {
        res.render('profile_edit', { ...nav.locals(req), theUser: req.targetUser, getNameForUserRole });
    });

    return router;
}

export default createRouter;
