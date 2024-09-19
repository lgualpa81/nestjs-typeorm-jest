import { Injectable } from '@nestjs/common';
import { TasksEntity } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectsService } from '../../../modules/projects/services/projects.service';
import { ErrorManager } from '../../../helpers';
import { TasksDTO } from '../dto/tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksEntity)
    private readonly taskRepository: Repository<TasksEntity>,

    private readonly projectService: ProjectsService,
  ) {}

  public async createTask(
    body: TasksDTO,
    projectId: string,
  ): Promise<TasksEntity> {
    try {
      const project = await this.projectService.findProjectById(projectId);
      if (project === undefined) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'No se ha encontrado el proyecto',
        });
      }
      return await this.taskRepository.save({
        ...body,
        project,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
