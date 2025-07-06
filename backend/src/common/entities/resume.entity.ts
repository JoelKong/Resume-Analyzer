import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FileStatus } from '../enums/file-status';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  jobUrl: string;

  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.NEW,
  })
  status: FileStatus;

  @Column({ type: 'jsonb', nullable: true })
  insights: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
