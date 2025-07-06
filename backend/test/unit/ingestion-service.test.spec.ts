import { Test, TestingModule } from '@nestjs/testing';
import { Resume } from '../../src/common/entities/resume.entity';
import { FileStatus } from '../../src/common/enums/file-status';
import { S3EventDto } from '../../src/ingestion/dtos/s3.request.dto';
import { IngestionService } from '../../src/ingestion/ingestion.service';
import { LlmService } from '../../src/llm/llm.service';
import { ResumeRepository } from '../../src/resume/resume.repository';
import { S3Service } from '../../src/s3/s3.service';

describe('IngestionService', () => {
  let service: IngestionService;
  let s3Service: jest.Mocked<S3Service>;
  let resumeRepository: jest.Mocked<ResumeRepository>;
  let llmService: jest.Mocked<LlmService>;

  const mockS3Service = {
    downloadFile: jest.fn(),
  };
  const mockResumeRepository = {
    findResumeByFileName: jest.fn(),
    save: jest.fn(),
  };
  const mockLlmService = {
    getTextFromPdf: jest.fn(),
    getJobDescriptionFromUrl: jest.fn(),
    generateInsights: jest.fn(),
  };
  let mockResume: Resume;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        { provide: S3Service, useValue: mockS3Service },
        { provide: ResumeRepository, useValue: mockResumeRepository },
        { provide: LlmService, useValue: mockLlmService },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    s3Service = module.get(S3Service);
    resumeRepository = module.get(ResumeRepository);
    llmService = module.get(LlmService);

    jest.clearAllMocks();
    mockResume = {
      id: 'uuid',
      fileName: 'test.pdf',
      jobUrl: 'http://example.com',
      status: FileStatus.NEW,
      insights: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processResume', () => {
    const s3Key = 'test.pdf';
    const s3Event: S3EventDto = {
      Records: [{ object: { key: s3Key }, bucket: { name: 'test-bucket' } }],
    };
    const mockResume: Resume = {
      id: 'uuid',
      fileName: s3Key,
      jobUrl: 'http://example.com',
      status: FileStatus.NEW,
      insights: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
});
