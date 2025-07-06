import { FileStatus } from 'src/common/enums/file-status';

export class GetResumeAnalysisResponseDto {
  id: string;
  status: FileStatus;
  insights?: Record<string, any>;
  message: string;
}
