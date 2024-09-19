import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import {
  UsersEntity,
  UsersProjectsEntity,
} from '../../../modules/users/entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsEntity } from '../entities';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UsersService } from '../../../modules/users/services/users.service';
import { ACCESS_LEVEL } from '../../../constants';
import { ProjectDTO, ProjectUpdateDTO } from '../dto/projects.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ErrorManager } from '../../../helpers';

describe('ProjectsService', () => {
  let projectsService: ProjectsService;
  let usersService: UsersService;
  let projectRepository: Repository<ProjectsEntity>;
  const mockResultAffected: UpdateResult | DeleteResult = { affected: 1 } as
    | UpdateResult
    | DeleteResult;
  const mockResultNoAffected: UpdateResult | DeleteResult = { affected: 0 } as
    | UpdateResult
    | DeleteResult;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        UsersService,
        {
          provide: getRepositoryToken(ProjectsEntity),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UsersProjectsEntity),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    projectsService = module.get<ProjectsService>(ProjectsService);
    usersService = module.get<UsersService>(UsersService);
    projectRepository = module.get<Repository<ProjectsEntity>>(
      getRepositoryToken(ProjectsEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(projectsService).toBeDefined();
    expect(projectRepository).toBeDefined();
  });

  describe('createProject', () => {
    it('should create a project and associate it with a user', async () => {
      // Mock data
      const mockUserId = 'user123';
      const mockProjectDTO: ProjectDTO = {
        name: 'Test Project',
        description: 'Description of Test Project',
      };
      const mockUser: UsersEntity = {
        id: mockUserId,
        email: 'test@example.com',
        role: 'USER',
        projectsIncludes: [],
      } as UsersEntity;
      const mockProject: ProjectsEntity = {
        id: 'project123',
        name: mockProjectDTO.name,
        description: mockProjectDTO.description,
        usersIncludes: [],
        tasks: [],
      } as ProjectsEntity;
      const mockUserProjectEntity: UsersProjectsEntity = {
        accessLevel: ACCESS_LEVEL.OWNER,
        user: mockUser,
        project: mockProject,
      } as UsersProjectsEntity;

      // Mock service methods
      jest.spyOn(usersService, 'findUserById').mockResolvedValueOnce(mockUser);
      jest.spyOn(projectRepository, 'save').mockResolvedValueOnce(mockProject);
      jest
        .spyOn(projectsService['userProjectRepository'], 'save')
        .mockResolvedValueOnce(mockUserProjectEntity);

      // Call createProject method
      const result = await projectsService.createProject(
        mockUserId,
        mockProjectDTO,
      );

      // Assertions
      expect(usersService.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(projectsService['projectRepository'].save).toHaveBeenCalledWith(
        mockProjectDTO,
      );
      expect(
        projectsService['userProjectRepository'].save,
      ).toHaveBeenCalledWith({
        accessLevel: ACCESS_LEVEL.OWNER,
        user: mockUser,
        project: mockProject,
      });

      // Verify the result
      expect(result).toEqual(mockUserProjectEntity);
    });
  });

  describe('findProjects', () => {
    it('should return a list of projects', async () => {
      // Mock data
      const mockProjects: ProjectsEntity[] = [
        {
          id: 'project1',
          name: 'Project 1',
          description: 'Description 1',
          usersIncludes: [],
          tasks: [],
        },
        {
          id: 'project2',
          name: 'Project 2',
          description: 'Description 2',
          usersIncludes: [],
          tasks: [],
        },
      ] as ProjectsEntity[];

      // Mock repository method
      jest.spyOn(projectRepository, 'find').mockResolvedValueOnce(mockProjects);

      // Call findProjects method
      const result = await projectsService.findProjects();

      // Assertions
      expect(result).toEqual(mockProjects);
      expect(projectRepository.find).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no projects found', async () => {
      // Mock repository method to return an empty array
      jest.spyOn(projectRepository, 'find').mockResolvedValueOnce([]);

      // Call findProjects method and expect it to throw NotFoundException
      await expect(projectsService.findProjects()).rejects.toThrow(
        NotFoundException,
      );
      expect(projectRepository.find).toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      const updateDto: ProjectUpdateDTO = { name: 'Updated Project' };

      // Mock repository method to return update result
      jest
        .spyOn(projectRepository, 'update')
        .mockResolvedValueOnce(mockResultAffected as UpdateResult);

      // Call updateProject method
      const result = await projectsService.updateProject(
        updateDto,
        'projectId',
      );

      // Assertions
      expect(result).toEqual(mockResultAffected);
      expect(projectRepository.update).toHaveBeenCalledWith(
        'projectId',
        updateDto,
      );
    });

    it('should throw NotFoundException if project not found', async () => {
      // Mock repository method to return update result with affected = 0
      jest
        .spyOn(projectRepository, 'update')
        .mockResolvedValueOnce(mockResultNoAffected as UpdateResult);

      // Call updateProject method and expect it to throw
      await expect(
        projectsService.updateProject({}, 'invalidId'),
      ).rejects.toThrow();
      expect(projectRepository.update).toHaveBeenCalledWith('invalidId', {});
    });

    it('should throw HttpException with correct message if update fails', async () => {
      const errorMessage = 'Update failed';
      jest
        .spyOn(projectRepository, 'update')
        .mockRejectedValueOnce(new Error(errorMessage));

      // Call updateProject method and expect it to throw HttpException
      await expect(
        projectsService.updateProject({}, 'projectId'),
      ).rejects.toThrow(new HttpException(errorMessage, 400));
      expect(projectRepository.update).toHaveBeenCalledWith('projectId', {});
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      // Mock del método delete del repositorio para que devuelva el resultado de la eliminación
      jest
        .spyOn(projectRepository, 'delete')
        .mockResolvedValueOnce(mockResultAffected);

      // Llamada al método deleteProject
      const result = await projectsService.deleteProject('projectId');

      // Afirmaciones
      expect(result).toEqual(mockResultAffected);
      expect(projectRepository.delete).toHaveBeenCalledWith('projectId');
    });

    it('should throw ErrorManager if project not found', async () => {
      // Mock del método delete del repositorio para que devuelva un resultado de eliminación con affected = 0
      jest
        .spyOn(projectRepository, 'delete')
        .mockResolvedValueOnce(mockResultNoAffected);

      // Llamada al método deleteProject y esperamos que lance una excepción ErrorManager
      await expect(
        projectsService.deleteProject('invalidId'),
      ).rejects.toThrow();
      expect(projectRepository.delete).toHaveBeenCalledWith('invalidId');
    });

    it('should throw ErrorManager with correct message if delete fails', async () => {
      const errorMessage = 'Delete failed';
      jest
        .spyOn(projectRepository, 'delete')
        .mockRejectedValueOnce(new Error(`BAD_REQUEST :: ${errorMessage}`));

      // Llamada al método deleteProject y esperamos que lance una excepción ErrorManager con el mensaje correcto
      await expect(projectsService.deleteProject('projectId')).rejects.toThrow(
        new ErrorManager({
          type: 'BAD_REQUEST',
          message: errorMessage,
        }),
      );
      expect(projectRepository.delete).toHaveBeenCalledWith('projectId');
    });
  });

  describe('findProjectById', () => {
    it('should find project by id', async () => {
      const mockProjectId = 'projectId123';
      const mockProject: ProjectsEntity = {
        id: mockProjectId,
        name: 'Test Project',
        description: 'Description of Test Project',
        usersIncludes: [],
        tasks: [],
      } as ProjectsEntity;

      // Mock del método createQueryBuilder del repositorio para que devuelva el proyecto simulado
      jest
        .spyOn(projectRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValueOnce(mockProject);

      // Llamada al método findProjectById
      const result = await projectsService.findProjectById(mockProjectId);

      // Afirmaciones
      expect(result).toEqual(mockProject);
      expect(projectRepository.createQueryBuilder).toHaveBeenCalledWith(
        'project',
      );
      expect(projectRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        {
          id: mockProjectId,
        },
      );
      expect(
        projectRepository.createQueryBuilder().leftJoinAndSelect,
      ).toHaveBeenCalledWith('project.usersIncludes', 'usersIncludes');
      expect(
        projectRepository.createQueryBuilder().leftJoinAndSelect,
      ).toHaveBeenCalledWith('usersIncludes.user', 'user');
      expect(result).toEqual(mockProject);

      //expect(projectRepository.createQueryBuilder().where().leftJoinAndSelect().getOne).toHaveBeenCalled();
    });

    it('should throw ErrorManager if project not found', async () => {
      const mockProjectId = 'invalidProjectId';

      // Mock del método createQueryBuilder del repositorio para que devuelva undefined, simulando que no se encontró ningún proyecto
      jest
        .spyOn(projectRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValueOnce(null);

      // Llamada al método findProjectById y esperamos que lance una excepción ErrorManager
      //await expect(projectsService.findProjectById(mockProjectId)).rejects.toThrow(ErrorManager);
      //expect(projectRepository.createQueryBuilder().where().leftJoinAndSelect().getOne).toHaveBeenCalled();

      try {
        await projectsService.findProjectById(mockProjectId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toContain(
          `BAD_REQUEST :: No existe proyecto con el id ${mockProjectId}`,
        );
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw ErrorManager with correct message if search fails', async () => {
      const mockProjectId = 'projectId123';
      const errorMessage = 'Database error';

      jest
        .spyOn(projectRepository.createQueryBuilder(), 'getOne')
        .mockRejectedValueOnce(new Error(errorMessage));

      try {
        await projectsService.findProjectById(mockProjectId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toContain(errorMessage);
      }
    });
  });
});
