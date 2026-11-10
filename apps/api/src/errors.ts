import type { ErrorRequestHandler, RequestHandler } from "express";
import type { ApiError } from "@fitsewa/shared";

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  const body: ApiError = { error: { code: "NOT_FOUND", message: "Route not found." } };
  res.status(404).json(body);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ApiError = { error: { code: err.code, message: err.message, details: err.details } };
    res.status(err.status).json(body);
    return;
  }
  // Never leak internals to clients.
  console.error(err);
  const body: ApiError = { error: { code: "INTERNAL_ERROR", message: "Something went wrong." } };
  res.status(500).json(body);
};
