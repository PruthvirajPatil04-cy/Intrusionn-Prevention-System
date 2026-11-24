/**
 * Authentication and authorization guard for /api/ips endpoints.
 * Supports Bearer token and custom header matching IPS_API_SECRET.
 */
export const DEFAULT_DEV_SECRET = "ips-dev-secret-token";

export function getExpectedSecret(): string {
  return process.env.IPS_API_SECRET || DEFAULT_DEV_SECRET;
}

export function isAuthenticated(req: Request): boolean {
  // Allow configured API secret check
  const expectedSecret = getExpectedSecret();

  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      if (parts[1] === expectedSecret) {
        return true;
      }
    }
  }

  // 2. Check X-IPS-Auth-Token header
  const customToken = req.headers.get("x-ips-auth-token");
  if (customToken === expectedSecret) {
    return true;
  }

  return false;
}
