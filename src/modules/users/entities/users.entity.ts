import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { ROLES } from '../../../constants';
import { UsersProjectsEntity } from '.';
import { BaseEntity } from '../../../config';
import { hashText } from '../../../helpers';

@Entity({ name: 'users' })
export class UsersEntity extends BaseEntity {
  @Column('text', {
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column({ type: 'enum', default: ROLES.USER, enum: ROLES })
  role: ROLES;

  @OneToMany(() => UsersProjectsEntity, (usersProjects) => usersProjects.user)
  projectsIncludes: UsersProjectsEntity[];

  @BeforeInsert()
  async checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
    if (this.password) this.password = await hashText(this.password);
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
