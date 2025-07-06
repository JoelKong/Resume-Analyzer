import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ResumeRepository } from './resume.repository';
import { UploadResumeRequestDto } from './dtos/request/upload-resume.request.dto';
import { UploadResumeResponseDto } from './dtos/response/upload-resume.response.dto';
import { S3Service } from '../s3/s3.service';
import { v4 as uuidv4 } from 'uuid';
import { FileStatus } from '../../src/common/enums/file-status';
import { GetResumeAnalysisResponseDto } from './dtos/response/get-resume-analysis.response.dto';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly resumeRepository: ResumeRepository,
    private readonly s3Service: S3Service,
  ) {}

  async uploadResume(
    file: Express.Multer.File,
    uploadResumeDto: UploadResumeRequestDto,
  ): Promise<UploadResumeResponseDto> {
    this.logger.log(`Processing upload for file: ${file.originalname}`);
    const fileId = uuidv4();
    const fileExtension = file.originalname.split('.').pop();
    const s3Key = `${fileId}.${fileExtension}`;

    try {
      await this.s3Service.uploadFile(file, s3Key);
    } catch (error) {
      this.logger.error(`S3 upload failed for ${s3Key}`, error.stack);
      throw new ServiceUnavailableException(
        'File upload service is currently unavailable. Please try again later.',
      );
    }

    try {
      const resume = await this.resumeRepository.createResume(
        s3Key,
        uploadResumeDto.jobUrl,
      );

      this.logger.log(
        `Successfully created resume record with id: ${resume.id}`,
      );

      return {
        id: resume.id,
        fileName: resume.fileName,
        status: resume.status,
        message: 'Resume uploaded successfully and is pending analysis.',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create resume record in database for ${s3Key}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to save resume information.',
      );
    }
  }

  async getResumeAnalysis(id: string): Promise<GetResumeAnalysisResponseDto> {
    this.logger.log(`Fetching analysis for resume id: ${id}`);
    const resume = await this.resumeRepository.findResumeById(id);

    if (!resume) {
      throw new NotFoundException(`Resume with ID "${id}" not found.`);
    }

    let message = '';
    switch (resume.status) {
      case FileStatus.PROCESSED:
        message = 'Analysis complete.';
        break;
      case FileStatus.PENDING:
      case FileStatus.NEW:
        message = 'Analysis is pending. Please check back later.';
        break;
      case FileStatus.INVALID:
        message = 'Analysis failed. There was an issue processing the resume.';
        break;
    }

    return {
      id: resume.id,
      status: resume.status,
      insights: resume.insights,
      message,
    };
  }
}
