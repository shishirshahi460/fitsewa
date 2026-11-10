import 'dotenv/config';
import { loadConfig } from "./config.js";
import { createApp } from "./app.js";
import { connectDb } from "./db.js";

const config = loadConfig();

async function main() {
  if (config.MONGODB_URI) {
    await connectDb(config.MONGODB_URI);
    console.log("MongoDB connected");
  } else {
    console.warn("MONGODB_URI not set: starting without a database (M1 only).");
  }
  createApp(config).listen(config.PORT, () => {
    console.log(`FitSewa API listening on :${config.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
