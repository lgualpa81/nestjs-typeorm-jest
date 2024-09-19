import { Module } from '@nestjs/common';
import { ProjectsService } from './services/projects.service';
import { ProjectsController } from './controllers/projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsEntity } from './entities';
import { UsersEntity, UsersProjectsEntity } from '../users/entities';
import { UsersService } from '../users/services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectsEntity,
      UsersProjectsEntity,
      UsersEntity,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, UsersService],
})
export class ProjectsModule {}
