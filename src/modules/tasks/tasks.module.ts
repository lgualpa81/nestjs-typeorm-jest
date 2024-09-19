import { Module } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { TasksController } from './controllers/tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsEntity } from '../projects/entities';
import { TasksEntity } from './entities';
import { ProjectsService } from '../projects/services/projects.service';
import { UsersEntity, UsersProjectsEntity } from '../users/entities';
import { UsersService } from '../users/services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TasksEntity,
      ProjectsEntity,
      UsersProjectsEntity,
      UsersEntity,
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService, ProjectsService, UsersService],
})
export class TasksModule {}
