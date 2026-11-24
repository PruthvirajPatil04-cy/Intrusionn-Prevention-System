import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { isAuthenticated } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { IpsPostRequestSchema } from "@/lib/schemas";

const execFileAsync = promisify(execFile);

function findIdsDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "..", "Intrusion-Detection_system"),
    path.resolve(process.cwd(), "Intrusion-Detection_system"),
    path.resolve("D:/Projects/Intrusion-Prevention-System/Intrusion-Detection_system"),
    path.resolve("D:/Projects/Intrusion-Detection_system"),
    process.cwd(),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "rules.json")) || fs.existsSync(path.join(dir, "main.py"))) {
      return dir;
    }
  }
  return candidates[0];
}

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "127.0.0.1";
}

export async function GET(req: Request) {
  // 1. Rate Limiting Check
  const clientIp = getClientIdentifier(req);
  const rateLimit = checkRateLimit(clientIp, 60, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Too many requests.", retryAfterSeconds: rateLimit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  // 2. Authentication Check
  if (!isAuthenticated(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid authentication token" },
      { status: 401 }
    );
  }

  try {
    const idsDir = findIdsDir();
    const rulesPath = path.join(idsDir, "rules.json");
    const alertsPath = path.join(idsDir, "logs", "ips_alerts.jsonl");

    let rules = null;
    if (fs.existsSync(rulesPath)) {
      const rulesData = fs.readFileSync(rulesPath, "utf-8");
      rules = JSON.parse(rulesData);
    }

    const alerts: any[] = [];
    if (fs.existsSync(alertsPath)) {
      const lines = fs.readFileSync(alertsPath, "utf-8").trim().split("\n");
      lines.slice(-50).reverse().forEach(line => {
        if (line.trim()) {
          try {
            alerts.push(JSON.parse(line));
          } catch {
            // ignore malformed lines
          }
        }
      });
    }

    return NextResponse.json({
      status: "operational",
      engine: "Python / Scapy Real-Time IPS",
      enginePath: idsDir,
      timestamp: new Date().toISOString(),
      rules,
      recentAlertsCount: alerts.length,
      alerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to read IPS engine state" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // 1. Rate Limiting Check (More conservative for execution operations)
  const clientIp = getClientIdentifier(req);
  const rateLimit = checkRateLimit(`post_${clientIp}`, 15, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before triggering engine actions.", retryAfterSeconds: rateLimit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  // 2. Authentication Check
  if (!isAuthenticated(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid authentication token" },
      { status: 401 }
    );
  }

  // 3. Input Validation via Zod Schema
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body provided" },
      { status: 400 }
    );
  }

  const parseResult = IpsPostRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parseResult.error.issues.map(i => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }

  const { action, targetIp } = parseResult.data;

  try {
    const idsDir = findIdsDir();

    if (action === "simulate") {
      const testScript = path.join(idsDir, "test_ips.py");
      if (!fs.existsSync(testScript)) {
        return NextResponse.json({ error: "Test script not found" }, { status: 404 });
      }

      // Safe subprocess execution: argument array, no shell execution, explicit timeout
      const { stdout, stderr } = await execFileAsync("python", [testScript], {
        cwd: idsDir,
        shell: false,
        timeout: 15000,
      });

      return NextResponse.json({
        success: true,
        message: "Threat simulation completed and logged to IPS engine successfully",
        stdout,
        stderr,
      });
    }

    if (action === "unblock" && targetIp) {
      const mainScript = path.join(idsDir, "main.py");
      const { stdout, stderr } = await execFileAsync("python", [mainScript, "--unblock", targetIp], {
        cwd: idsDir,
        shell: false,
        timeout: 10000,
      });

      return NextResponse.json({
        success: true,
        message: `Unblock operation executed for ${targetIp}`,
        stdout,
        stderr,
      });
    }

    if (action === "status") {
      return NextResponse.json({ success: true, message: "Engine status verified" });
    }

    return NextResponse.json({ error: "Action not supported" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to execute engine command" },
      { status: 500 }
    );
  }
}
