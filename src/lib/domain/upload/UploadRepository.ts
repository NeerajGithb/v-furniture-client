import { IUploadRepository } from "./IUploadRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import {
  FileUploadRequest,
  Base64UploadRequest,
  UploadResponse,
} from "./UploadSchemas";
import { CloudinaryUploadError } from "./UploadErrors";
import cloudinary from "@/lib/cloudinary";

export class UploadRepository implements IUploadRepository {
  // Upload file to Cloudinary
  async uploadFile(data: FileUploadRequest): Promise<UploadResponse> {
    try {
      // Convert Blob/File to Node Buffer
      const arrayBuffer = await (data.file as Blob).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary using upload_stream
      const result = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: data.folder }, (error, result) => {
            if (error) {
              reject(new CloudinaryUploadError(error.message));
            } else if (!result) {
              reject(new CloudinaryUploadError("No result from Cloudinary"));
            } else {
              resolve(result as { secure_url: string; public_id: string });
            }
          })
          .end(buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      if (error instanceof CloudinaryUploadError) {
        throw error;
      }
      throw new RepositoryError("Failed to upload file", error as Error);
    }
  }

  // Upload base64 image to Cloudinary
  async uploadBase64(data: Base64UploadRequest): Promise<UploadResponse> {
    try {
      const result = await cloudinary.uploader.upload(data.image, {
        folder: data.folder,
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      throw new RepositoryError(
        "Failed to upload base64 image",
        error as Error,
      );
    }
  }
}
