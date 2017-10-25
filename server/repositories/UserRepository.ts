import * as Passport from 'passport';
import { EntityRepository, Repository, Transaction } from 'typeorm';

import { User } from '../entities/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    verifyUser(profile: Passport.Profile): Promise<User> {
        return this.manager.transaction(async manager => {
            let user: User | undefined = await manager.findOne(User, { where: { googleId: profile.id } });
            if (!user || !user.googleId) {
                user = new User();
                user.googleId = profile.id;
                user.displayName = profile.displayName;
                user.givenName = profile.name ? profile.name.givenName : '';
                user.familyName = profile.name ? profile.name.familyName : '';
            }
            return manager.save(user);
        });
    }
}
