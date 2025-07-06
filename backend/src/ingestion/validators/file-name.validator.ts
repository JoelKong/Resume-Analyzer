import { BaseValidator } from '../../common/validators/base.validator';
import { IngestionContext } from './ingestion-context';

export class FileNameValidator extends BaseValidator<IngestionContext> {
  protected handleValidation(data: IngestionContext): string | null {
    const pdfRegex = /\.pdf$/i;
    if (!pdfRegex.test(data.resume.fileName)) {
      return 'Invalid file type. Only PDF files are allowed.';
    }
    return null;
  }
}
