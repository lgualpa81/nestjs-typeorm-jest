import { BaseEntity } from '../../../config';
import { ACCESS_LEVEL } from '../../../constants';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersEntity } from '.';
import { ProjectsEntity } from '../../../modules/projects/entities';

@Entity({ name: 'users_projects' })
export class UsersProjectsEntity extends BaseEntity {
  @Column({ type: 'enum', enum: ACCESS_LEVEL })
  accessLevel: ACCESS_LEVEL;

  @ManyToOne(() => UsersEntity, (user) => user.projectsIncludes)
  user: UsersEntity;

  @ManyToOne(() => ProjectsEntity, (project) => project.usersIncludes)
  project: ProjectsEntity;
}
