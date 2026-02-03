import { NotFoundError, BusinessRuleError } from "../shared/DomainError";

export class NoFileProvidedError extends BusinessRuleError {
  readonly code = "NO_FILE_PROVIDED";
  constructor() {
    super("No file provided for upload");
  }
}

export class UnsupportedContentTypeError extends BusinessRuleError {
  readonly code = "UNSUPPORTED_CONTENT_TYPE";
  constructor(contentType: string) {
    super(`Unsupported Content-Type: ${contentType}`);
  }
}

export class InvalidFileFormatError extends BusinessRuleError {
  readonly code = "INVALID_FILE_FORMAT";
  constructor(message: string = "Invalid file format") {
    super(message);
  }
}

export class CloudinaryUploadError extends BusinessRuleError {
  readonly code = "CLOUDINARY_UPLOAD_ERROR";
  constructor(message: string = "Failed to upload file to Cloudinary") {
    super(message);
  }
}

export class InvalidJsonBodyError extends BusinessRuleError {
  readonly code = "INVALID_JSON_BODY";
  constructor() {
    super("Invalid JSON body provided");
  }
}

export class MissingUploadDataError extends BusinessRuleError {
  readonly code = "MISSING_UPLOAD_DATA";
  constructor(field: string) {
    super(`Missing required field: ${field}`);
  }
}
