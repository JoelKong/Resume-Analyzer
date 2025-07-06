import { IsNotEmpty, IsUrl } from 'class-validator';

export class UploadResumeDto {
  @IsUrl({}, { message: 'A valid job URL is required.' })
  @IsNotEmpty()
  jobUrl: string;
}
