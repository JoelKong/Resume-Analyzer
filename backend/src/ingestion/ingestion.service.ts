import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { ResumeRepository } from '../resume/resume.repository';
import { StateMachine } from '../common/statemachine/statemachine';
import { FileStatus } from '../common/enums/file-status';
import { FileStatusEvent } from '../common/statemachine/resume/resume.state-machine.events';
import { Resume } from '../common/entities/resume.entity';
import { fileTransitions } from '../common/statemachine/resume/resume.state-machine';
import { ValidatorChain } from '../common/validators/validator-chain';
import { S3EventDto } from './dtos/s3.request.dto';
import { FileNameValidator } from './validators/file-name.validator';
import { FileSizeValidator } from './validators/file-size.validator';
import { IngestionContext } from './validators/ingestion-context';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly stateMachine: StateMachine<
    FileStatus,
    FileStatusEvent,
    Resume
  >;

  constructor(
    private readonly s3Service: S3Service,
    private readonly resumeRepository: ResumeRepository,
    private readonly llmService: LlmService,
  ) {
    this.stateMachine = new StateMachine();
    this.stateMachine.register(fileTransitions);
  }

  async processResume(s3Event: S3EventDto): Promise<void> {
    for (const record of s3Event.Records) {
      const s3Key = record.object.key;
      this.logger.log(`Processing S3 event for key: ${s3Key}`);

      const resume = await this.resumeRepository.findResumeByFileName(s3Key);
      if (!resume) {
        this.logger.error(`No resume found for S3 key: ${s3Key}`);
        return;
      }

      try {
        // 1. Transition to PENDING
        this.stateMachine.trigger(
          resume.status,
          FileStatusEvent.SET_PENDING,
          resume,
        );
        await this.resumeRepository.save(resume);
        this.logger.log(`Resume ${resume.id} status set to PENDING.`);

        // 2. Download and Validate
        const fileBuffer = await this.s3Service.downloadFile(s3Key);
        const validationContext: IngestionContext = {
          resume,
          file: fileBuffer,
        };
        const validator = new ValidatorChain([
          new FileNameValidator(),
          new FileSizeValidator(),
        ]);

        const validationError = validator.validate(validationContext);
        if (validationError) {
          throw new Error(validationError);
        }
        this.logger.log(`Resume ${resume.id} passed validation.`);

        // 3. Prompt LLM
        this.logger.log(
          `Extracting text and job description for resume ${resume.id}...`,
        );
        const resumeText = await this.llmService.getTextFromPdf(fileBuffer);
        const jobDescriptionText =
          await this.llmService.getJobDescriptionFromUrl(resume.jobUrl);

        const insights = await this.llmService.generateInsights(
          resumeText,
          jobDescriptionText,
        );
        resume.insights = insights;
        this.logger.log(`Insights generated for resume ${resume.id}.`);

        // 4. Transition to PROCESSED
        this.stateMachine.trigger(
          resume.status,
          FileStatusEvent.SET_PROCESSED,
          resume,
        );
        await this.resumeRepository.save(resume);
        this.logger.log(`Resume ${resume.id} successfully processed.`);
      } catch (error) {
        this.logger.error(
          `Failed to process resume ${resume.id}: ${error.message}`,
          error.stack,
        );
        // 5. Transition to INVALID
        this.stateMachine.trigger(
          resume.status,
          FileStatusEvent.SET_INVALID,
          resume,
        );
        await this.resumeRepository.save(resume);

        // For transient errors, rethrow to allow SQS to retry.
        if (
          !(
            error.message.includes('limit') ||
            error.message.includes('type') ||
            error.message.includes('parse') ||
            error.message.includes('fetch')
          )
        ) {
          throw error;
        }
      }
    }
  }
}
