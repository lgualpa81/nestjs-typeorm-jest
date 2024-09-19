import { Body, Controller, Param, Post } from '@nestjs/common';
import { TasksService } from '../services/tasks.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { TasksDTO } from '../dto/tasks.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiParam({
    name: 'projectId',
  })
  @Post('create/:projectId')
  public async createTask(
    @Body() body: TasksDTO,
    @Param('projectId') projectId: string,
  ) {
    return this.tasksService.createTask(body, projectId);
  }
}
