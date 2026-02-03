export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { uploadService } from "@/lib/domain/upload/UploadService";
import {
  FileUploadSchema,
  Base64UploadSchema,
} from "@/lib/domain/upload/UploadSchemas";
import {
  UnsupportedContentTypeError,
  NoFileProvidedError,
  InvalidJsonBodyError,
  MissingUploadDataError,
} from "@/lib/domain/upload/UploadErrors";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const POST = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const contentType = request.headers.get("content-type");
    const uploadType = uploadService.getUploadType(contentType);

    if (uploadType === "unsupported") {
      throw new UnsupportedContentTypeError(contentType || "unknown");
    }

    if (uploadType === "file") {
      // Handle FormData uploads (files from browser)
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file) {
        throw new NoFileProvidedError();
      }

      // Validate at route boundary
      const validatedData = FileUploadSchema.parse({
        file,
        folder: (formData.get("folder") as string) || "furniture-store",
      });

      const result = await uploadService.uploadFile(validatedData);
      return ApiResponseBuilder.success(result, 201);
    }

    if (uploadType === "base64") {
      // Handle base64 JSON uploads
      let body;
      try {
        body = await request.json();
      } catch (error) {
        throw new InvalidJsonBodyError();
      }

      const { image, folder } = body || {};

      if (!image) {
        throw new MissingUploadDataError("image");
      }

      if (!folder) {
        throw new MissingUploadDataError("folder");
      }

      // Validate at route boundary
      const validatedData = Base64UploadSchema.parse({ image, folder });

      const result = await uploadService.uploadBase64(validatedData);
      return ApiResponseBuilder.success(result, 201);
    }

    // This should never be reached due to uploadType check above
    throw new UnsupportedContentTypeError(contentType || "unknown");
  }),
);
