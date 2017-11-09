import { AfterLoad, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './User';

@Entity()
export class School {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(type => User)
    @JoinTable({ name: 'students' })
    students?: User[];

    @Column('varchar', { nullable: true })
    name: string | null;

    @Column('text', { nullable: true })
    _validationData: string | null;

    validEmailDomains: string[] | null;

    @AfterLoad()
    private afterLoad() {
        if (this._validationData) {
            const obj = JSON.parse(this._validationData);
            this.validEmailDomains = obj.validEmailDomains;
        }
    }
}
