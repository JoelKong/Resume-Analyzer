import { BaseValidator } from '../../common/validators/base.validator';
import { IngestionContext } from './ingestion-context';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export class FileSizeValidator extends BaseValidator<IngestionContext> {
  protected handleValidation(data: IngestionContext): string | null {
    if (data.file.byteLength > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds the limit of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`;
    }
    return null;
  }
}
