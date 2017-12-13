import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ValidationError, ForbiddenError } from '../errors';
import { UserJSON } from '../../common/json';

export enum UserRole {
    None = 0,
    Student = 10,
    Tutor = 20,
    Teacher = 30,
    Admin = 100,
}

export function getNameForUserRole(role: UserRole): string {
    return UserRole[role];
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 40, unique: true, nullable: true })
    googleId: string | null;

    @Column()
    displayName: string;

    @Column('varchar', { nullable: true })
    givenName: string | null;

    @Column('varchar', { nullable: true })
    familyName: string | null;

    @Column('varchar', { nullable: true })
    biography: string | null;

    @Column('int', { length: 2 })
    role: UserRole = UserRole.Student;

    get roleName() {
        return getNameForUserRole(this.role);
    }

    get url() {
        return '/profile/' + this.id;
    }

    updateFromData(body: any, modifyingUser: User) {
        const role = Number(body.role);
        if (isNaN(role)) throw new ValidationError({ field: 'role', message: 'role is not a number' });
        if (!modifyingUser.allowedRoleChanges.includes(role))
            throw new ForbiddenError({ field: 'role', message: `You are not allowed to set user role to ${role}`, role });
        if (typeof body.bio !== "string") throw new ValidationError({ field: 'bio', message: 'bio is not a string' })
        if (body.bio.length >= 250)
            throw new ValidationError({ field: 'bio', message: 'bio is too long', length: body.bio.length, maxLength: 250 });
        if (typeof body.displayName !== "string") throw new ValidationError({ field: 'displayName', message: 'displayName is not a string' })
        if (body.displayName.length > 100)
            throw new ValidationError({ field: 'displayName', message: 'displayName is too long', length: body.displayName.length, maxLength: 100 });
        this.role = body.role;
        this.biography = body.bio;
        this.displayName = body.displayName;
        return true;
    }

    userCanModify(user: User): boolean {
        return this.id === user.id || user.role >= UserRole.Teacher;
    }

    get allowedRoleChanges(): UserRole[] {
        switch (this.role) {
            case UserRole.Admin:
                return [UserRole.None, UserRole.Student, UserRole.Tutor, UserRole.Teacher, UserRole.Admin];
            case UserRole.Teacher:
                return [UserRole.None, UserRole.Student, UserRole.Tutor, UserRole.Teacher];
            default:
                return [];
        }
    }

    toJSON(): UserJSON {
        return {
            id: this.id, googleId: this.googleId, displayName: this.displayName, biography: this.biography,
            role: this.role,
        };
    }
}
