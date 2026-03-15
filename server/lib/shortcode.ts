import { customAlphabet } from "nanoid";
import { Link } from "../models/Link.js";

// URL-safe alphabet, no ambiguous chars (0, O, l, I)
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const generate = customAlphabet(alphabet, 6);

/**
 * Generates a unique 6-character short code, retrying on collision.
 */
export async function generateShortCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const code = generate();
    const exists = await Link.findOne({ shortCode: code });
    if (!exists) return code;
    attempts++;
  }
  // Fallback: try 8 chars
  const longer = customAlphabet(alphabet, 8);
  return longer();
}

/**
 * Validates a custom alias: lowercase alphanumeric + hyphens, 3–30 chars
 */
export function isValidAlias(alias: string): boolean {
  return /^[a-z0-9-]{3,30}$/.test(alias);
}

/**
 * Reserved slugs that cannot be used as custom aliases
 */
const RESERVED = new Set([
  "api", "auth", "login", "signup", "dashboard", "analytics",
  "admin", "settings", "profile", "links", "redirect", "health",
  "static", "assets", "public", "p", "s", "404",
]);

export function isReservedAlias(alias: string): boolean {
  return RESERVED.has(alias.toLowerCase());
}
