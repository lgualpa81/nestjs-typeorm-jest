import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  create_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  update_at: Date;
}
