import 'reflect-metadata';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

ConfigModule.forRoot({
  envFilePath: `.env.${process.env.NODE_ENV}`,
});

const configService = new ConfigService();

export const dataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
  synchronize: true,
  migrationsRun: true,
  logging: true,
};

export const envs = {
  jwtSecret: configService.get('JWT_SECRET'),
};

//export const AppDs = new DataSource(dataSourceConfig);
