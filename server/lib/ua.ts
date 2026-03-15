/**
 * Lightweight UA parser — avoids heavy dependencies.
 * Returns device type, browser name, and OS name.
 */
export function parseUserAgent(ua: string = ""): {
  device: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  os: string;
} {
  const s = ua.toLowerCase();

  // Device
  let device: "desktop" | "mobile" | "tablet" | "unknown" = "unknown";
  if (/tablet|ipad|playbook|silk/.test(s)) {
    device = "tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone/.test(s)) {
    device = "mobile";
  } else if (ua.length > 0) {
    device = "desktop";
  }

  // Browser
  let browser = "Unknown";
  if (/edg\//.test(s)) browser = "Edge";
  else if (/opr\/|opera/.test(s)) browser = "Opera";
  else if (/chrome\//.test(s) && !/chromium/.test(s)) browser = "Chrome";
  else if (/firefox\//.test(s)) browser = "Firefox";
  else if (/safari\//.test(s) && !/chrome/.test(s)) browser = "Safari";
  else if (/trident\/|msie/.test(s)) browser = "Internet Explorer";

  // OS
  let os = "Unknown";
  if (/windows nt/.test(s)) os = "Windows";
  else if (/mac os x|macos/.test(s)) os = "macOS";
  else if (/android/.test(s)) os = "Android";
  else if (/iphone|ipad|ipod/.test(s)) os = "iOS";
  else if (/linux/.test(s)) os = "Linux";

  return { device, browser, os };
}
