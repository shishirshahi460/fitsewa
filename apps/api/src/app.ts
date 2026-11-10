import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { API_VERSION, type HealthResponse } from "@fitsewa/shared";
import type { Config } from "./config.js";
import { errorHandler, notFoundHandler } from "./errors.js";

export function createApp(config: Config): Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        // Non-browser clients (no Origin header) are allowed; browsers must match an exact origin.
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  const v1 = express.Router();
  v1.get("/health", (_req, res) => {
    const body: HealthResponse = {
      status: "ok",
      service: "fitsewa-api",
      version: process.env.npm_package_version ?? "0.0.0",
      time: new Date().toISOString()
    };
    res.json(body);
  });
  app.use(`/api/${API_VERSION}`, v1);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
