import Redis from "ioredis";

let client: Redis | null = null;
let isConnected = false;

/**
 * Initialize Redis client. Gracefully skips if REDIS_URL is not set
 * or connection fails — the app falls back to DB-only lookups.
 */
export function initRedis(): void {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.log("[redis] REDIS_URL not set — caching disabled");
    return;
  }

  try {
    client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 5) return null; // stop retrying
        return Math.min(times * 200, 2000);
      },
      lazyConnect: false,
    });

    client.on("connect", () => {
      isConnected = true;
      console.log("[redis] Connected");
    });

    client.on("error", (err: Error) => {
      console.error("[redis] Error:", err.message);
      isConnected = false;
    });

    client.on("close", () => {
      isConnected = false;
    });
  } catch (err: any) {
    console.error("[redis] Failed to initialize:", err.message);
    client = null;
  }
}

/**
 * Get a cached value. Returns null on miss or if Redis is unavailable.
 */
export async function getCache(key: string): Promise<string | null> {
  if (!client || !isConnected) return null;
  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

/**
 * Set a cached value with TTL in seconds.
 */
export async function setCache(
  key: string,
  value: string,
  ttlSeconds: number = 3600
): Promise<void> {
  if (!client || !isConnected) return;
  try {
    await client.set(key, value, "EX", ttlSeconds);
  } catch {
    // Silently fail — caching is best-effort
  }
}

/**
 * Delete a cached key (cache invalidation).
 */
export async function deleteCache(key: string): Promise<void> {
  if (!client || !isConnected) return;
  try {
    await client.del(key);
  } catch {
    // Silently fail
  }
}
