import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Logger,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { UploadResumeRequestDto } from './dtos/request/upload-resume.request.dto';
import { UploadResumeResponseDto } from './dtos/response/upload-resume.response.dto';
import { GetResumeAnalysisResponseDto } from './dtos/response/get-resume-analysis.response.dto';

@Controller('resume')
export class ResumeController {
  private readonly logger = new Logger(ResumeController.name);

  constructor(private readonly resumeService: ResumeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadResumeRequestDto: UploadResumeRequestDto,
  ): Promise<UploadResumeResponseDto> {
    this.logger.log(
      `Received request to upload file ${file.originalname} for job URL: ${uploadResumeRequestDto.jobUrl}`,
    );
    return this.resumeService.uploadResume(file, uploadResumeRequestDto);
  }

  @Get('analysis/:id')
  async getResumeAnalysis(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GetResumeAnalysisResponseDto> {
    this.logger.log(`Received request for analysis of resume id: ${id}`);
    return this.resumeService.getResumeAnalysis(id);
  }
}
