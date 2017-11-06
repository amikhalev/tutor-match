import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
    None = 0,
    Student = 10,
    Tutor = 20,
    Teacher = 30,
    Admin = 100,
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
        return UserRole[this.role];
    }

    get url() {
        return '/profile/' + this.id;
    }

    updateFromData(body: any) {
        if (body.bio && body.bio.length <= 250) {
            this.biography = body.bio;
        }
    }

    userCanModify(user: User): boolean {
        return this.id === user.id || user.role >= UserRole.Teacher;
    }
}
