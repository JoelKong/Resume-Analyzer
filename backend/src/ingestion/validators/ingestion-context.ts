import { Resume } from '../../common/entities/resume.entity';

export interface IngestionContext {
  resume: Resume;
  file: Buffer;
}
