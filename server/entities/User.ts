import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
    None = 0,
    Admin = 1,
    Teacher = 2,
    Tutor = 3,
    Student = 4,
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 40, unique: true })
    googleId: string;

    @Column()
    displayName: string;

    @Column()
    givenName: string;

    @Column()
    familyName: string;

    @Column('int', { length: 2 })
    role: UserRole = UserRole.Student;

    get roleName() {
        return UserRole[this.role];
    }
}
