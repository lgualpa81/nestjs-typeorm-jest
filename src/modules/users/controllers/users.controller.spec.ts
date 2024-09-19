import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersEntity, UsersProjectsEntity } from '../entities';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UpdateUserDTO, UserToProjectDTO } from '../dto/user.dto';
import { ProjectsEntity } from '../../../modules/projects/entities';
import { ACCESS_LEVEL } from '../../../constants';

describe('UsersController', () => {
  let userController: UsersController;
  let userService: UsersService;
  let userProjectRepository: Repository<UsersProjectsEntity>;
  let userRepository: Repository<UsersEntity>;

  const mockResultAffected: UpdateResult | DeleteResult = { affected: 1 } as
    | UpdateResult
    | DeleteResult;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: getRepositoryToken(UsersProjectsEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: {},
        },

        UsersService,
        JwtService,
      ],
    }).compile();

    userController = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
    userProjectRepository = module.get<Repository<UsersProjectsEntity>>(
      getRepositoryToken(UsersProjectsEntity),
    );
    userRepository = module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
    expect(userProjectRepository).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('Users', () => {
    it('should get all users', async () => {
      const mockUsers: UsersEntity[] = [
        { email: 'foo@bar.com', role: 'USER' },
      ] as UsersEntity[];
      const findSpy = jest
        .spyOn(userService, 'findUsers')
        .mockResolvedValueOnce(mockUsers);
      const result = await userController.findAllUsers();

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(1);
    });

    it('should find a user by uuid', async () => {
      const mockUser: UsersEntity = {
        id: 'test-id',
        email: 'test@example.com',
        role: 'USER',
      } as UsersEntity;

      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      const result = await userController.findUserByUUID('test-id');
      expect(userService.findUserById).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should call updateUser service with correct parameters', async () => {
      const mockId = 'uuid123';
      const mockUpdateUserDTO: UpdateUserDTO = {
        name: 'Updated Name',
        password: 'newPassword',
      };

      const updateSpy = jest
        .spyOn(userService, 'updateUser')
        .mockResolvedValueOnce(mockResultAffected as UpdateResult);

      const user = await userController.updateUser(mockId, mockUpdateUserDTO);

      expect(updateSpy).toHaveBeenCalledWith(mockUpdateUserDTO, mockId);
      expect(user).toEqual(mockResultAffected);
    });
  });

  describe('deleteUser', () => {
    it('should call deleteUser service with correct parameters', async () => {
      const mockId = 'uuid123';

      const deleteSpy = jest
        .spyOn(userService, 'deleteUser')
        .mockResolvedValueOnce(mockResultAffected);

      const user = await userController.deleteUser(mockId);

      expect(deleteSpy).toHaveBeenCalledWith(mockId);
      expect(user).toEqual(mockResultAffected);
    });
  });

  describe('addToProject', () => {
    it('should call relationToProject service with correct parameters', async () => {
      const mockProjectId = 'project123';
      const user = new UsersEntity();
      user.id = 'uuid123';
      user.email = 'test@example.com';

      const project = new ProjectsEntity();
      project.id = 'uuid1';
      project.name = 'Project 1';

      const mockUserToProjectDTO: UserToProjectDTO = {
        user,
        project,
        accessLevel: ACCESS_LEVEL.DEVELOPER,
      };
      const mockRelation = {
        ...mockUserToProjectDTO,
        id: 'relation-id',
      } as UsersProjectsEntity;
      // Mock service method to resolve with any value or promise
      jest
        .spyOn(userService, 'relationToProject')
        .mockResolvedValueOnce(mockRelation);

      // Call addToProject method on controller with mock parameters
      await userController.addToProject(mockUserToProjectDTO, mockProjectId);

      // Assert that the relationToProject method on the service was called with the correct arguments
      expect(userService.relationToProject).toHaveBeenCalledWith({
        ...mockUserToProjectDTO,
        project: mockProjectId as unknown as ProjectsEntity, // Simulating casting to ProjectsEntity
      });
    });
  });
});
