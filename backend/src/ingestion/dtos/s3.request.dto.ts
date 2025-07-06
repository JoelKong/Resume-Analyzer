import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

class S3ObjectDto {
  @IsString()
  key: string;
}

class S3BucketDto {
  @IsString()
  name: string;
}

class S3RecordDto {
  @ValidateNested()
  @Type(() => S3BucketDto)
  bucket: S3BucketDto;

  @ValidateNested()
  @Type(() => S3ObjectDto)
  object: S3ObjectDto;
}

export class S3EventDto {
  @ValidateNested({ each: true })
  @Type(() => S3RecordDto)
  Records: S3RecordDto[];
}
