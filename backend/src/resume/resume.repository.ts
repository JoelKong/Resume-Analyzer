import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../common/entities/resume.entity';
import { FileStatus } from '../../src/common/enums/file-status';

@Injectable()
export class ResumeRepository {
  private readonly logger = new Logger(ResumeRepository.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
  ) {}

  async createResume(fileName: string, jobUrl: string): Promise<Resume> {
    this.logger.log(`Creating resume record for ${fileName}`);
    const resume = this.resumeRepository.create({
      fileName,
      jobUrl,
      status: FileStatus.NEW,
    });

    return this.resumeRepository.save(resume);
  }

  async findResumeById(id: string): Promise<Resume | null> {
    this.logger.log(`Finding resume with id: ${id}`);
    return this.resumeRepository.findOneBy({ id });
  }

  async findResumeByFileName(fileName: string): Promise<Resume | null> {
    this.logger.log(`Finding resume with fileName: ${fileName}`);
    return this.resumeRepository.findOneBy({ fileName });
  }

  async save(resume: Resume): Promise<Resume> {
    return this.resumeRepository.save(resume);
  }
}
