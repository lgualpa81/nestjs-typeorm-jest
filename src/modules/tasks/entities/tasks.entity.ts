import { STATUS_TASK } from '../../../constants';
import { BaseEntity } from '../../../config';
import { ProjectsEntity } from '../../../modules/projects/entities';
import { ManyToOne, JoinColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'task' })
export class TasksEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: STATUS_TASK })
  status: STATUS_TASK;

  @Column()
  responsableName: string;

  @ManyToOne(() => ProjectsEntity, (project) => project.tasks)
  @JoinColumn({
    name: 'project_id',
  })
  project: ProjectsEntity;
}
