import fs from "fs";
import path from "path";
import { getExpectedSecret } from "@/lib/auth";

export const dynamic = "force-dynamic";

function findAlertsFilePath(): string {
  const candidates = [
    path.resolve(process.cwd(), "..", "Intrusion-Detection_system", "logs", "ips_alerts.jsonl"),
    path.resolve(process.cwd(), "Intrusion-Detection_system", "logs", "ips_alerts.jsonl"),
    path.resolve("D:/Projects/Intrusion-Prevention-System/Intrusion-Detection_system/logs/ips_alerts.jsonl"),
    path.resolve("D:/Projects/Intrusion-Detection_system/logs/ips_alerts.jsonl"),
    path.resolve(process.cwd(), "logs", "ips_alerts.jsonl"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return candidates[0];
}

export async function GET(req: Request) {
  // Validate token via query parameter or header (EventSource does not support custom headers natively in browser)
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-ips-auth-token") || "";
  const expectedToken = getExpectedSecret();

  if (token !== expectedToken) {
    return new Response(JSON.stringify({ error: "Unauthorized SSE stream" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const alertsPath = findAlertsFilePath();
  let lastReadSize = 0;
  if (fs.existsSync(alertsPath)) {
    try {
      lastReadSize = fs.statSync(alertsPath).size;
    } catch {
      lastReadSize = 0;
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connected event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "streaming", timestamp: new Date().toISOString() })}\n\n`)
      );

      // 2. Poll file for newly appended JSON lines every 1.5s
      const fileCheckInterval = setInterval(() => {
        if (!fs.existsSync(alertsPath)) return;

        try {
          const stats = fs.statSync(alertsPath);
          if (stats.size > lastReadSize) {
            const streamFD = fs.openSync(alertsPath, "r");
            const bufferSize = stats.size - lastReadSize;
            const buffer = Buffer.alloc(bufferSize);
            fs.readSync(streamFD, buffer, 0, bufferSize, lastReadSize);
            fs.closeSync(streamFD);
            lastReadSize = stats.size;

            const newContent = buffer.toString("utf-8");
            const lines = newContent.trim().split("\n");
            for (const line of lines) {
              if (line.trim()) {
                try {
                  const eventObj = JSON.parse(line.trim());
                  // Limit event payload size if needed and enqueue
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventObj)}\n\n`));
                } catch {
                  // ignore partial or malformed lines
                }
              }
            }
          }
        } catch {
          // Stream read error
        }
      }, 1500);

      // 3. Heartbeat comment every 15s to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // Cleanup when stream closes
      req.signal.addEventListener("abort", () => {
        clearInterval(fileCheckInterval);
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
