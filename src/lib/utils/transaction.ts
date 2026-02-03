import mongoose from "mongoose";

/**
 * Higher-order function to wrap database operations in a MongoDB transaction
 * Automatically handles session creation, cleanup, and error handling
 */
export async function withTransaction<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(operation);
  } finally {
    await session.endSession();
  }
}

/**
 * Alternative helper for operations that need manual transaction control
 * Use this when you need more control over the transaction lifecycle
 */
export async function withSession<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();

  try {
    return await operation(session);
  } finally {
    await session.endSession();
  }
}
