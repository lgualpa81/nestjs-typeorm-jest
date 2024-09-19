import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { UsersService } from './users.service';
import { UsersEntity, UsersProjectsEntity } from '../entities';
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserToProjectDTO,
} from '../dto/user.dto';
import { ACCESS_LEVEL } from '../../../constants';
import { ProjectsEntity } from '../../../modules/projects/entities';

export class userRepositoryMock {
  find = jest.fn();
  findOne = jest.fn();
  findOneBy = jest.fn();
  create = jest.fn();
  save = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  metadata = {
    propertiesMap: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
    },
  };
  createQueryBuilder = jest.fn().mockReturnThis();
  where = jest.fn().mockReturnThis();
  leftJoinAndSelect = jest.fn().mockReturnThis();
  getOne = jest.fn();
}

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<UsersEntity>;
  let userProjectRepository: Repository<UsersProjectsEntity>;

  // Datos de prueba reutilizables
  const mockUUID = 'uuid1234';
  const mockCreateUserDto: CreateUserDTO = {
    name: 'testuser',
    email: 'abc@test.com',
    password: 'testpassword',
  };
  const mockUpdateUserDto: UpdateUserDTO = {
    email: 'newemail@example.com',
    name: 'New Name',
  };
  const mockResultAffected: UpdateResult | DeleteResult = { affected: 1 } as
    | UpdateResult
    | DeleteResult;
  const mockResultNoAffected: UpdateResult | DeleteResult = { affected: 0 } as
    | UpdateResult
    | DeleteResult;
  const mockErrorMessage = 'Database error';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UsersEntity),
          useClass: userRepositoryMock,
          // useValue: {
          //   findOne: jest.fn(),
          //   create: jest.fn(),
          //   save: jest.fn(),
          // }
        },
        {
          provide: getRepositoryToken(UsersProjectsEntity),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
    userProjectRepository = module.get<Repository<UsersProjectsEntity>>(
      getRepositoryToken(UsersProjectsEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userProjectRepository).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user without password when filter by email and includePassword is false', async () => {
      const email = 'existingUser@fake.com';
      const mockUser = {
        email: 'joe@test.com',
        id: 'uuid123',
        role: 'USER',
      } as UsersEntity;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(mockUser);
      const response = await usersService.findOneByEmail(email);

      expect(response).not.toHaveProperty('password');
      expect(response).toEqual(mockUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
    });

    it('should return a user with password when filter by email and includePassword is true', async () => {
      const email = 'existingUser@fake.com';
      const mockUser = {
        id: 'uuid123',
        email,
        password: 'hashedPassword',
        role: 'USER',
      } as unknown as UsersEntity;
      const select = ['id', 'name', 'email', 'password', 'role'];

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      const response = await usersService.findOneByEmail(email, true);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select,
      });
      expect(response).toHaveProperty('password');
      expect(response).toEqual(mockUser);
    });

    it('should return null when user does not exist', async () => {
      const email = 'invalid@example.com';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      const response = await usersService.findOneByEmail(email);

      expect(response).toBeNull();
    });
  });

  describe('create', () => {
    it('should add a new user if not exists', async () => {
      const createdUser = {
        id: 'uuid123',
        ...mockCreateUserDto,
        password: 'hashedPassword',
        role: 'USER',
      } as unknown as UsersEntity;

      const createSpy = jest
        .spyOn(userRepository, 'create')
        .mockReturnValue(createdUser);
      const saveSpy = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(createdUser);
      const user = await usersService.create(mockCreateUserDto);

      expect(createSpy).toHaveBeenCalledWith(mockCreateUserDto);
      expect(saveSpy).toHaveBeenCalledWith(createdUser);
      expect(user).toEqual(createdUser);
    });

    it('should throw an exception if creation fails', async () => {
      const createdUser = {
        id: 'uuid123',
        ...mockCreateUserDto,
        role: 'USER',
      } as unknown as UsersEntity;

      jest.spyOn(userRepository, 'create').mockReturnValue(createdUser);
      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error(mockErrorMessage));

      await expect(usersService.create(mockCreateUserDto)).rejects.toThrow(
        mockErrorMessage,
      );
    });
  });

  describe('findUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers: UsersEntity[] = [
        { email: 'foo@bar.com', role: 'USER' },
      ] as UsersEntity[];

      const findSpy = jest
        .spyOn(userRepository, 'find')
        .mockResolvedValueOnce(mockUsers);
      const result = await usersService.findUsers();

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should throw an error if find fails', () => {
      jest
        .spyOn(userRepository, 'find')
        .mockRejectedValueOnce(new Error(mockErrorMessage));

      const result = () => usersService.findUsers();

      expect(result).rejects.toThrow(HttpException);
    });
  });

  describe('findUserById', () => {
    it('should return a user with their projects if found', async () => {
      const id = 'uuid123';
      const mockUser = {
        id,
        email: 'user@example.com',
        projectsIncludes: [
          {
            accessLevel: 'USER',
            project: { id: 'uuid777', name: 'project1' },
          },
        ],
      } as unknown as UsersEntity;

      jest
        .spyOn(userRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValueOnce(mockUser);

      const result = await usersService.findUserById(id);

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(userRepository.createQueryBuilder().where).toHaveBeenCalledWith({
        id,
      });
      expect(
        userRepository.createQueryBuilder().leftJoinAndSelect,
      ).toHaveBeenCalledWith('user.projectsIncludes', 'projectsIncludes');
      expect(
        userRepository.createQueryBuilder().leftJoinAndSelect,
      ).toHaveBeenCalledWith('projectsIncludes.project', 'project');
      expect(result).toEqual(mockUser);
    });

    it('should throw a BAD_REQUEST error if user is not found', async () => {
      const id = 'test-id';

      jest
        .spyOn(userRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValueOnce(null);

      try {
        await usersService.findUserById(id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toContain(
          'BAD_REQUEST :: No se encontro resultado',
        );
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an error if query fails', async () => {
      const id = 'test-id';

      jest
        .spyOn(userRepository.createQueryBuilder(), 'getOne')
        .mockRejectedValueOnce(new Error(mockErrorMessage));

      try {
        await usersService.findUserById(id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toContain(mockErrorMessage);
      }
    });
  });

  describe('relationToProject', () => {
    it('should save the relation between user and project', async () => {
      const user = new UsersEntity();
      user.id = 'uuid123';
      user.email = 'test@example.com';

      const project = new ProjectsEntity();
      project.id = 'uuid1';
      project.name = 'Project 1';

      const dto: UserToProjectDTO = {
        user,
        project,
        accessLevel: ACCESS_LEVEL.DEVELOPER,
      };
      const mockRelation = { ...dto, id: 'relation-id' } as UsersProjectsEntity;

      jest
        .spyOn(userProjectRepository, 'save')
        .mockResolvedValueOnce(mockRelation);

      const result = await usersService.relationToProject(dto);

      expect(userProjectRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockRelation);
    });

    it('should throw an error if saving fails', async () => {
      const user = new UsersEntity();
      user.id = 'uuid123';
      user.email = 'test@example.com';

      const project = new ProjectsEntity();
      project.id = 'uuid1';
      project.name = 'Project 1';

      const dto: UserToProjectDTO = {
        user,
        project,
        accessLevel: ACCESS_LEVEL.DEVELOPER,
      };

      jest
        .spyOn(userProjectRepository, 'save')
        .mockRejectedValueOnce(new Error(mockErrorMessage));

      try {
        await usersService.relationToProject(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toContain(mockErrorMessage);
      }
    });
  });

  describe('updateUser', () => {
    it('should update an existing user by id', async () => {
      const updateSpy = jest
        .spyOn(userRepository, 'update')
        .mockResolvedValueOnce(mockResultAffected as UpdateResult);
      const user = await usersService.updateUser(mockUpdateUserDto, mockUUID);

      expect(updateSpy).toHaveBeenCalledWith(mockUUID, mockUpdateUserDto);
      expect(user).toEqual(mockResultAffected);
    });

    it('should throw an error if no user is updated', () => {
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue(mockResultNoAffected as UpdateResult);
      const user = () => usersService.updateUser(mockUpdateUserDto, mockUUID);

      expect(user).rejects.toThrow('BAD_REQUEST :: No se pudo actualizar');
    });

    it('should throw an error if update fails', async () => {
      jest
        .spyOn(userRepository, 'update')
        .mockRejectedValue(new Error(mockErrorMessage));

      await expect(
        usersService.updateUser(mockUpdateUserDto, mockUUID),
      ).rejects.toThrow(mockErrorMessage);
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user by id', async () => {
      const deleteSpy = jest
        .spyOn(userRepository, 'delete')
        .mockResolvedValueOnce(mockResultAffected);
      const user = await usersService.deleteUser(mockUUID);

      expect(deleteSpy).toHaveBeenCalledWith(mockUUID);
      expect(user).toEqual(mockResultAffected);
    });

    it('should throw an error if no user is deleted', () => {
      jest
        .spyOn(userRepository, 'delete')
        .mockResolvedValue(mockResultNoAffected);
      const user = () => usersService.deleteUser(mockUUID);

      expect(user).rejects.toThrow('BAD_REQUEST :: No se pudo borrar');
    });

    it('should throw an error if delete fails', async () => {
      jest
        .spyOn(userRepository, 'delete')
        .mockRejectedValue(new Error(mockErrorMessage));

      await expect(usersService.deleteUser(mockUUID)).rejects.toThrow(
        mockErrorMessage,
      );
    });
  });
});
