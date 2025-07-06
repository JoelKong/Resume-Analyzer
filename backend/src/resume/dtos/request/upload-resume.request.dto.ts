import { IsNotEmpty, IsUrl } from 'class-validator';

export class UploadResumeRequestDto {
  @IsUrl({}, { message: 'A valid job URL is required.' })
  @IsNotEmpty()
  jobUrl: string;
}
