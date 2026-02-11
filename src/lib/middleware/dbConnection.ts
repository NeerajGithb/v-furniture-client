import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
// Import all models to ensure they're registered with Mongoose
import "@/models";

type Handler<T extends any[]> = (...args: T) => Promise<NextResponse>;

export function withDB<T extends any[]>(handler: Handler<T>): Handler<T> {
  return async (...args: T): Promise<NextResponse> => {
    try {
      await connectDB();
      return await handler(...args);
    } catch (error) {
      if (error instanceof Error) {
        return ApiResponseBuilder.error(error);
      }
      return ApiResponseBuilder.error(new Error("Database connection failed"), 500);
    }
  };
}