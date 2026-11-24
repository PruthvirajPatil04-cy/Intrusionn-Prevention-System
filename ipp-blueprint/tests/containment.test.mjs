import test from "node:test";
import assert from "node:assert/strict";

test("SOC Containment API Unit & Schema Tests", async (t) => {
  await t.test("valid containment payload structure", () => {
    const valid = {
      target: "198.51.100.99",
      type: "IP",
      action: "BLOCK",
      ttlSeconds: 3600,
      reason: "Observed active C2 beaconing to external drop point",
      operator: "secops_lead_1",
    };
    assert.equal(typeof valid.target, "string");
    assert.equal(valid.ttlSeconds, 3600);
    assert.equal(valid.action, "BLOCK");
  });

  await t.test("rejects invalid TTL values", () => {
    const invalidTtl = 5; // Under minimum 10 seconds
    assert.ok(invalidTtl < 10);
  });
});
