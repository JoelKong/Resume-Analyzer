import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { S3Module } from '../s3/s3.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from '../common/entities/resume.entity';
import { ResumeRepository } from 'src/resume/resume.repository';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [S3Module, TypeOrmModule.forFeature([Resume]), LlmModule],
  providers: [IngestionService, ResumeRepository],
  exports: [IngestionService],
})
export class IngestionModule {}
