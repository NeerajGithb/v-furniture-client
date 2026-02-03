import { IUploadRepository } from "./IUploadRepository";
import { UploadRepository } from "./UploadRepository";
import { FileUploadRequest, Base64UploadRequest } from "./UploadSchemas";
import {
  NoFileProvidedError,
  UnsupportedContentTypeError,
  InvalidFileFormatError,
  InvalidJsonBodyError,
  MissingUploadDataError,
} from "./UploadErrors";

export class UploadService {
  constructor(private repository: IUploadRepository = new UploadRepository()) {}

  // Handle file upload
  async uploadFile(data: FileUploadRequest) {
    if (!data.file) {
      throw new NoFileProvidedError();
    }

    // Validate file type (basic validation)
    if (!(data.file instanceof File) && !(data.file instanceof Blob)) {
      throw new InvalidFileFormatError(
        "File must be a valid File or Blob object",
      );
    }

    const result = await this.repository.uploadFile(data);

    return {
      success: true,
      message: "File uploaded successfully",
      data: result,
    };
  }

  // Handle base64 upload
  async uploadBase64(data: Base64UploadRequest) {
    if (!data.image) {
      throw new MissingUploadDataError("image");
    }

    if (!data.folder) {
      throw new MissingUploadDataError("folder");
    }

    const result = await this.repository.uploadBase64(data);

    return {
      success: true,
      message: "Base64 image uploaded successfully",
      data: result,
    };
  }

  // Determine upload type based on content type
  getUploadType(contentType: string | null): "file" | "base64" | "unsupported" {
    if (contentType?.includes("multipart/form-data")) {
      return "file";
    }

    if (contentType?.includes("application/json")) {
      return "base64";
    }

    return "unsupported";
  }
}

// Create default instance
export const uploadService = new UploadService();
