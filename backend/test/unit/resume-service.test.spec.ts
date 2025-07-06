import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Resume } from '../../src/common/entities/resume.entity';
import { FileStatus } from '../../src/common/enums/file-status';
import { ResumeRepository } from '../../src/resume/resume.repository';
import { ResumeService } from '../../src/resume/resume.service';
import { S3Service } from '../../src/s3/s3.service';

describe('ResumeService', () => {
  let service: ResumeService;
  let resumeRepository: jest.Mocked<ResumeRepository>;
  let s3Service: jest.Mocked<S3Service>;

  const mockResumeRepository = {
    createResume: jest.fn(),
    findResumeById: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        { provide: ResumeRepository, useValue: mockResumeRepository },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
    resumeRepository = module.get(ResumeRepository);
    s3Service = module.get(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadResume', () => {
    const file: Express.Multer.File = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('test'),
      size: 100,
    } as Express.Multer.File;
    const uploadDto = { jobUrl: 'http://example.com' };

    it('should upload a file and create a resume record', async () => {
      const createdResume = {
        id: 'some-uuid',
        fileName: 'some-uuid.pdf',
        status: FileStatus.NEW,
      } as Resume;
      s3Service.uploadFile.mockResolvedValue('some-uuid.pdf');
      resumeRepository.createResume.mockResolvedValue(createdResume);

      const result = await service.uploadResume(file, uploadDto);

      expect(s3Service.uploadFile).toHaveBeenCalled();
      expect(resumeRepository.createResume).toHaveBeenCalledWith(
        expect.any(String),
        uploadDto.jobUrl,
      );
      expect(result).toEqual({
        id: createdResume.id,
        fileName: createdResume.fileName,
        status: createdResume.status,
        message: 'Resume uploaded successfully and is pending analysis.',
      });
    });

    it('should throw ServiceUnavailableException if S3 upload fails', async () => {
      s3Service.uploadFile.mockRejectedValue(new Error('S3 Error'));
      await expect(service.uploadResume(file, uploadDto)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should throw InternalServerErrorException if database creation fails', async () => {
      s3Service.uploadFile.mockResolvedValue('some-uuid.pdf');
      resumeRepository.createResume.mockRejectedValue(new Error('DB Error'));
      await expect(service.uploadResume(file, uploadDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getResumeAnalysis', () => {
    it('should return analysis for a processed resume', async () => {
      const resume = {
        id: 'some-uuid',
        status: FileStatus.PROCESSED,
        insights: { summary: 'Good fit' },
      } as unknown as Resume;
      resumeRepository.findResumeById.mockResolvedValue(resume);

      const result = await service.getResumeAnalysis('some-uuid');

      expect(result.message).toBe('Analysis complete.');
      expect(result.status).toBe(FileStatus.PROCESSED);
      expect(result.insights).toEqual({ summary: 'Good fit' });
    });

    it('should return pending message for a pending resume', async () => {
      const resume = { id: 'some-uuid', status: FileStatus.PENDING } as Resume;
      resumeRepository.findResumeById.mockResolvedValue(resume);

      const result = await service.getResumeAnalysis('some-uuid');

      expect(result.message).toBe(
        'Analysis is pending. Please check back later.',
      );
      expect(result.status).toBe(FileStatus.PENDING);
    });

    it('should throw NotFoundException if resume does not exist', async () => {
      resumeRepository.findResumeById.mockResolvedValue(null);
      await expect(
        service.getResumeAnalysis('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
