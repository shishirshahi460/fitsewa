import { describe, expect, it } from "vitest";
import request from "supertest";
import { healthResponseSchema, apiErrorSchema } from "@fitsewa/shared";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig({ NODE_ENV: "test", CORS_ORIGINS: "http://localhost:3000" } as NodeJS.ProcessEnv);
const app = createApp(config);

describe("api", () => {
  it("returns a valid health payload", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(healthResponseSchema.safeParse(res.body).success).toBe(true);
  });
  it("uses the error envelope for unknown routes", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(apiErrorSchema.safeParse(res.body).success).toBe(true);
  });
  it("allows only configured CORS origins", async () => {
    const ok = await request(app).get("/api/v1/health").set("Origin", "http://localhost:3000");
    expect(ok.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    const bad = await request(app).get("/api/v1/health").set("Origin", "https://evil.example");
    expect(bad.headers["access-control-allow-origin"]).toBeUndefined();
  });
  it("rejects wildcard CORS config", () => {
    expect(() => loadConfig({ CORS_ORIGINS: "*" } as NodeJS.ProcessEnv)).toThrow();
  });
  it("sets security headers and hides x-powered-by", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });
});
