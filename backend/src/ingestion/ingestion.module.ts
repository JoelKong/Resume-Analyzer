import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Module({
  providers: [IngestionService]
})
export class IngestionModule {}
