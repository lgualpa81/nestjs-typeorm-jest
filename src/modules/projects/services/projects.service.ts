import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ProjectsEntity } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/services/users.service';
import { UsersProjectsEntity } from '../../users/entities';
import { ProjectDTO, ProjectUpdateDTO } from '../dto/projects.dto';
import { ACCESS_LEVEL } from '../../../constants';
import { ErrorManager } from '../../../helpers';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectsEntity)
    private readonly projectRepository: Repository<ProjectsEntity>,

    @InjectRepository(UsersProjectsEntity)
    private readonly userProjectRepository: Repository<UsersProjectsEntity>,
    private readonly userService: UsersService,
  ) {}

  async createProject(userId: string, body: ProjectDTO) {
    const user = await this.userService.findUserById(userId);
    const project = await this.projectRepository.save(body);
    return await this.userProjectRepository.save({
      accessLevel: ACCESS_LEVEL.OWNER,
      user: user,
      project,
    });
  }

  async findProjects() {
    const projects = await this.projectRepository.find();
    if (projects.length === 0) throw new NotFoundException();
    return projects;
  }

  public async findProjectById(id: string): Promise<ProjectsEntity> {
    try {
      const project = await this.projectRepository
        .createQueryBuilder('project')
        .where({ id })
        .leftJoinAndSelect('project.usersIncludes', 'usersIncludes')
        .leftJoinAndSelect('usersIncludes.user', 'user')
        .getOne();
      if (!project) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No existe proyecto con el id ' + id,
        });
      }
      return project;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateProject(
    body: ProjectUpdateDTO,
    id: string,
  ): Promise<UpdateResult> {
    try {
      const project: UpdateResult = await this.projectRepository.update(
        id,
        body,
      );
      if (project.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar proyecto',
        });
      }
      return project;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteProject(id: string): Promise<DeleteResult> {
    try {
      const project: DeleteResult = await this.projectRepository.delete(id);
      if (project.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar proyecto',
        });
      }
      return project;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
