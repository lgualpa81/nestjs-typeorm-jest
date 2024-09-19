import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { STATUS_TASK } from '../../../constants';
import { ProjectDTO } from '../../../modules/projects/dto/projects.dto';

export class TasksDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  taskName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  taskDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(STATUS_TASK)
  status: STATUS_TASK;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  responsableName: string;

  @ApiProperty()
  @IsOptional()
  project?: ProjectDTO;
}
