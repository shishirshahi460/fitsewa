import mongoose from "mongoose";

/** Connects to MongoDB Atlas. Called from server.ts only when MONGODB_URI is set. */
export async function connectDb(uri: string) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return mongoose.connection;
}
