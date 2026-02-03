import {
  FileUploadRequest,
  Base64UploadRequest,
  UploadResponse,
} from "./UploadSchemas";

export interface IUploadRepository {
  // File upload operations
  uploadFile(data: FileUploadRequest): Promise<UploadResponse>;

  // Base64 upload operations
  uploadBase64(data: Base64UploadRequest): Promise<UploadResponse>;
}
