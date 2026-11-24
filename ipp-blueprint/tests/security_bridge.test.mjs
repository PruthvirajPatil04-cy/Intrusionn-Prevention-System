import test from "node:test";
import assert from "node:assert/strict";
import { isAuthenticated, DEFAULT_DEV_SECRET } from "../lib/auth.ts";
import { checkRateLimit } from "../lib/rateLimit.ts";
import { IpsPostRequestSchema } from "../lib/schemas.ts";

test("Authentication Guard Tests", async (t) => {
  await t.test("rejects request without authorization header", () => {
    const req = new Request("http://localhost:3000/api/ips");
    assert.equal(isAuthenticated(req), false);
  });

  await t.test("rejects invalid Bearer token", () => {
    const req = new Request("http://localhost:3000/api/ips", {
      headers: { authorization: "Bearer invalid-token-12345" },
    });
    assert.equal(isAuthenticated(req), false);
  });

  await t.test("accepts valid Bearer token", () => {
    const req = new Request("http://localhost:3000/api/ips", {
      headers: { authorization: `Bearer ${DEFAULT_DEV_SECRET}` },
    });
    assert.equal(isAuthenticated(req), true);
  });

  await t.test("accepts valid X-IPS-Auth-Token header", () => {
    const req = new Request("http://localhost:3000/api/ips", {
      headers: { "x-ips-auth-token": DEFAULT_DEV_SECRET },
    });
    assert.equal(isAuthenticated(req), true);
  });
});

test("Rate Limiter Tests", async (t) => {
  const testId = `test-ip-${Date.now()}`;
  const limit = 5;

  for (let i = 0; i < limit; i++) {
    const result = checkRateLimit(testId, limit, 10000);
    assert.equal(result.allowed, true, `Request ${i + 1} should be allowed`);
  }

  // Next request exceeds limit
  const exceeded = checkRateLimit(testId, limit, 10000);
  assert.equal(exceeded.allowed, false);
  assert.equal(exceeded.remaining, 0);
  assert.ok(exceeded.retryAfterSeconds > 0);
});

test("Zod Request Validation Tests", async (t) => {
  await t.test("accepts valid simulation action", () => {
    const parsed = IpsPostRequestSchema.safeParse({ action: "simulate" });
    assert.equal(parsed.success, true);
  });

  await t.test("accepts valid unblock action with targetIp", () => {
    const parsed = IpsPostRequestSchema.safeParse({
      action: "unblock",
      targetIp: "192.168.1.50",
    });
    assert.equal(parsed.success, true);
  });

  await t.test("rejects unknown action command", () => {
    const parsed = IpsPostRequestSchema.safeParse({ action: "drop_database" });
    assert.equal(parsed.success, false);
  });

  await t.test("rejects unexpected fields (strict schema)", () => {
    const parsed = IpsPostRequestSchema.safeParse({
      action: "simulate",
      unexpected_hack: "true",
    });
    assert.equal(parsed.success, false);
  });

  await t.test("rejects malformed IP address in targetIp", () => {
    const parsed = IpsPostRequestSchema.safeParse({
      action: "unblock",
      targetIp: "192.168.1.999; rm -rf /",
    });
    assert.equal(parsed.success, false);
  });
});
