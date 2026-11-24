import { z } from "zod";

/**
 * Strict Zod schema for /api/ips requests.
 * Rejects unexpected properties with .strict().
 */
export const IpsPostRequestSchema = z
  .object({
    action: z.enum(["simulate", "status", "unblock"]),
    targetIp: z
      .string()
      .regex(
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        "Invalid IPv4 address format"
      )
      .optional(),
  })
  .strict();

export type IpsPostRequest = z.infer<typeof IpsPostRequestSchema>;
