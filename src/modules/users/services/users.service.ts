import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../entities/users.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ErrorManager } from '../../../helpers/error.manager';
import { UsersProjectsEntity } from '../entities';
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserToProjectDTO,
} from '../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,

    @InjectRepository(UsersProjectsEntity)
    private readonly userProjectRepository: Repository<UsersProjectsEntity>,
  ) {}

  findOneByEmail(
    email: string,
    includePassword: boolean = false,
  ): Promise<UsersEntity | null> {
    if (!includePassword) return this.userRepository.findOneBy({ email });
    const select = Object.keys(
      this.userRepository.metadata.propertiesMap,
    ) as (keyof UsersEntity)[];
    return this.userRepository.findOne({ where: { email }, select });
  }

  async create(payload: CreateUserDTO): Promise<UsersEntity> {
    try {
      const user: UsersEntity = this.userRepository.create(payload);
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findUsers(): Promise<UsersEntity[]> {
    try {
      const users: UsersEntity[] = await this.userRepository.find();
      return users;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findUserById(id: string): Promise<UsersEntity> {
    try {
      const user: UsersEntity = await this.userRepository
        .createQueryBuilder('user')
        .where({ id })
        .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
        .leftJoinAndSelect('projectsIncludes.project', 'project')
        .getOne();
      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro resultado',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async relationToProject(body: UserToProjectDTO) {
    try {
      return await this.userProjectRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateUser(
    body: UpdateUserDTO,
    id: string,
  ): Promise<UpdateResult> {
    try {
      const user: UpdateResult = await this.userRepository.update(id, body);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteUser(id: string): Promise<DeleteResult | undefined> {
    try {
      const user: DeleteResult = await this.userRepository.delete(id);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
