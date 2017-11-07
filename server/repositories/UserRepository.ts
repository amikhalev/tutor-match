import * as Passport from 'passport';
import { EntityRepository, Repository } from 'typeorm';

import { User, UserRole } from '../entities/User';

import { School } from '../entities/School';

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
                if (profile.emails) {
                    profile.emails.forEach(element => {
                    if (element.type === 'account' && user) {
                        user.email = element.value;
                    }
                    });
                }
            } else {
                //temporary stuff :)
                if (user.displayName.startsWith('Avery')) {
                user.role = UserRole.Admin;
                }
                const school = new School();
                school.name = 'Test School';
                manager.save(school);
                user.school = school;
            }
            return manager.save(user);
        });
    }
}
