import mongoose from "mongoose";
import {
  DatabaseUnavailableError,
  DatabaseConfigurationError,
} from "./domain/shared/InfrastructureError";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  try {
    // Return existing connection if available
    if (cached.conn && mongoose.connection.readyState === 1) {
      return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new DatabaseConfigurationError(
        "MONGODB_URI is missing in environment variables",
      );
    }

    if (!cached.promise) {
      const options: mongoose.ConnectOptions = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 2,
      };

      cached.promise = mongoose
        .connect(MONGODB_URI, options)
        .then((mongooseInstance) => {
          return mongooseInstance;
        })
        .catch((err) => {
          cached.promise = null;
          throw new DatabaseUnavailableError(
            "Failed to connect to MongoDB database",
            err,
          );
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    
    if (error instanceof DatabaseConfigurationError || error instanceof DatabaseUnavailableError) {
      throw error;
    }
    
    throw new DatabaseUnavailableError(
      "Unexpected database connection error",
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}