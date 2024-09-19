import { IProject } from '../../../interfaces';
import { BaseEntity } from '../../../config';
import { Column, Entity, OneToMany } from 'typeorm';
import { UsersProjectsEntity } from '../../../modules/users/entities';
import { TasksEntity } from '../../../modules/tasks/entities';

@Entity({ name: 'projects' })
export class ProjectsEntity extends BaseEntity implements IProject {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(
    () => UsersProjectsEntity,
    (usersProjects) => usersProjects.project,
  )
  usersIncludes: UsersProjectsEntity[];

  @OneToMany(() => TasksEntity, (tasks) => tasks.project)
  tasks: TasksEntity[];
}
