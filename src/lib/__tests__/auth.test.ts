// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const { mockSet, mockGet, mockDelete } = vi.hoisted(() => ({
  mockSet: vi.fn(),
  mockGet: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({ set: mockSet, get: mockGet, delete: mockDelete })
  ),
}));

import { createSession } from "@/lib/auth";

const TEST_SECRET = new TextEncoder().encode("development-secret-key");
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets an auth-token cookie", async () => {
    await createSession("user-123", "test@example.com");
    expect(mockSet).toHaveBeenCalledOnce();
    expect(mockSet.mock.calls[0][0]).toBe("auth-token");
  });

  it("creates a valid JWT containing userId and email", async () => {
    await createSession("user-123", "test@example.com");
    const token = mockSet.mock.calls[0][1];
    const { payload } = await jwtVerify(token, TEST_SECRET);
    expect(payload.userId).toBe("user-123");
    expect(payload.email).toBe("test@example.com");
  });

  it("sets cookie expiry approximately 7 days from now", async () => {
    const before = Date.now();
    await createSession("user-123", "test@example.com");
    const after = Date.now();
    const { expires } = mockSet.mock.calls[0][2];
    expect(expires.getTime()).toBeGreaterThanOrEqual(before + SEVEN_DAYS_MS - 1000);
    expect(expires.getTime()).toBeLessThanOrEqual(after + SEVEN_DAYS_MS + 1000);
  });

  it("sets httpOnly, sameSite, and path cookie options", async () => {
    await createSession("user-123", "test@example.com");
    const options = mockSet.mock.calls[0][2];
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  it("does not set the secure flag outside production", async () => {
    await createSession("user-123", "test@example.com");
    expect(mockSet.mock.calls[0][2].secure).toBe(false);
  });

  it("encodes the correct userId and email for different inputs", async () => {
    await createSession("user-456", "another@example.com");
    const token = mockSet.mock.calls[0][1];
    const { payload } = await jwtVerify(token, TEST_SECRET);
    expect(payload.userId).toBe("user-456");
    expect(payload.email).toBe("another@example.com");
  });

  it("produces a JWT that expires in 7 days", async () => {
    const before = Math.floor(Date.now() / 1000);
    await createSession("user-123", "test@example.com");
    const after = Math.floor(Date.now() / 1000);
    const token = mockSet.mock.calls[0][1];
    const { payload } = await jwtVerify(token, TEST_SECRET);
    const sevenDaysSec = 7 * 24 * 60 * 60;
    expect(payload.exp).toBeGreaterThanOrEqual(before + sevenDaysSec - 5);
    expect(payload.exp).toBeLessThanOrEqual(after + sevenDaysSec + 5);
  });
});
