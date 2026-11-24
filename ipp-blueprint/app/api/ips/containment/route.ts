import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function findAuditLogPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "..", "Intrusion-Detection_system", "logs", "soc_containment_audit.jsonl"),
    path.resolve(process.cwd(), "Intrusion-Detection_system", "logs", "soc_containment_audit.jsonl"),
    path.resolve("D:/Projects/Intrusion-Prevention-System/Intrusion-Detection_system/logs/soc_containment_audit.jsonl"),
    path.resolve(process.cwd(), "logs", "soc_containment_audit.jsonl"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c) || fs.existsSync(path.dirname(c))) {
      return c;
    }
  }
  return candidates[0];
}

const ContainmentPostSchema = z
  .object({
    target: z.string().min(1, "Target cannot be empty"),
    type: z.enum(["IP", "DOMAIN"]),
    action: z.enum(["BLOCK", "ISOLATE"]),
    ttlSeconds: z.number().int().min(10).max(86400 * 30),
    reason: z.string().min(3, "Reason must be at least 3 characters"),
    operator: z.string().min(2, "Operator ID required"),
  })
  .strict();

const ContainmentDeleteSchema = z
  .object({
    target: z.string().min(1, "Target cannot be empty"),
    reason: z.string().min(3, "Reason required"),
    operator: z.string().min(2, "Operator ID required"),
  })
  .strict();

function appendAuditEvent(event: Record<string, any>) {
  const auditPath = findAuditLogPath();
  const dir = path.dirname(auditPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.appendFileSync(auditPath, JSON.stringify(event) + "\n", "utf-8");
}

export async function GET(req: Request) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized: Missing valid authentication" }, { status: 401 });
  }

  const auditPath = findAuditLogPath();
  const auditTrail: any[] = [];
  if (fs.existsSync(auditPath)) {
    const lines = fs.readFileSync(auditPath, "utf-8").trim().split("\n");
    for (const l of lines.slice(-50).reverse()) {
      if (l.trim()) {
        try {
          auditTrail.push(JSON.parse(l.trim()));
        } catch {}
      }
    }
  }

  return NextResponse.json({
    status: "active",
    endpoint: "SOC Emergency Containment API",
    auditRecordCount: auditTrail.length,
    recentAuditTrail: auditTrail,
  });
}

export async function POST(req: Request) {
  const rateLimit = checkRateLimit("containment_post", 20, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized: Missing valid authentication" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ContainmentPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { target, type, action, ttlSeconds, reason, operator } = parsed.data;
  const auditId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const auditEntry = {
    audit_id: auditId,
    timestamp,
    operation: "APPLY_CONTAINMENT",
    target,
    type,
    action,
    ttl_seconds: ttlSeconds,
    reason,
    operator,
    status: "ENFORCED",
  };

  appendAuditEvent(auditEntry);

  return NextResponse.json({
    success: true,
    message: `Containment action '${action}' applied to ${type} '${target}' by operator '${operator}'`,
    audit_id: auditId,
    expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  });
}

export async function DELETE(req: Request) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized: Missing valid authentication" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ContainmentDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { target, reason, operator } = parsed.data;
  const auditId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const auditEntry = {
    audit_id: auditId,
    timestamp,
    operation: "REMOVE_CONTAINMENT",
    target,
    reason,
    operator,
    status: "RELEASED",
  };

  appendAuditEvent(auditEntry);

  return NextResponse.json({
    success: true,
    message: `Containment released for '${target}' by operator '${operator}'`,
    audit_id: auditId,
  });
}
