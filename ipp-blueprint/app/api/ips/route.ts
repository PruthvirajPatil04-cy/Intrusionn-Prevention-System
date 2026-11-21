import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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

export async function GET() {
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
      alerts
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error?.message || "Failed to read IPS engine state"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "simulate";

    if (action === "simulate") {
      const idsDir = findIdsDir();
      const testScript = path.join(idsDir, "test_ips.py");
      
      const { stdout, stderr } = await execAsync(`python "${testScript}"`, { cwd: idsDir });
      
      return NextResponse.json({
        success: true,
        message: "Threat simulation completed and logged to IPS engine successfully",
        stdout,
        stderr
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({
      error: err?.message || "Failed to execute engine command"
    }, { status: 500 });
  }
}
