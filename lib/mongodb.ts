import mongoose from "mongoose";

type MongooseCache = {
  promise: Promise<typeof mongoose> | null;
};

// Stored on globalThis so hot reloads in dev reuse one connection.
const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = (globalForMongoose.mongooseCache ??= {
  promise: null,
});

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  cache.promise ??= mongoose.connect(uri, { bufferCommands: false });

  try {
    return await cache.promise;
  } catch (error) {
    // Clear the failed attempt so the next request can retry.
    cache.promise = null;
    throw error;
  }
}
