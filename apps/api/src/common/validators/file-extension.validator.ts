import { FileValidator } from '@nestjs/common';

interface FileExtensionValidatorOptions {
  extensions: string[];
}

export class FileExtensionValidator extends FileValidator<FileExtensionValidatorOptions> {
  constructor(options: FileExtensionValidatorOptions) {
    super({
      extensions: options.extensions.map((ext) =>
        ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
      ),
    });
  }

  isValid(file?: Express.Multer.File): boolean {
    const { originalname } = (file ?? {}) as { originalname?: string };

    if (!originalname) {
      return false;
    }

    const lowerName = originalname.toLowerCase();
    return this.validationOptions.extensions.some((ext) =>
      lowerName.endsWith(ext),
    );
  }

  buildErrorMessage(): string {
    return `Неправильний формат файлу. Дозволені розширення: ${this.validationOptions.extensions.join(', ')}`;
  }
}
