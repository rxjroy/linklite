import type {
  AuthResponse,
  CreateLinkPayload,
  UpdateLinkPayload,
  PaginatedLinks,
  LinkItem,
  OverviewStats,
  LinkAnalytics,
  DashboardStats,
  AdminStats,
  AdminUser,
} from "@shared/types";

const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(requiresAuth ? authHeaders() : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    signup: (name: string, email: string, password: string) =>
      request<AuthResponse>("POST", "/auth/signup", { name, email, password }, false),

    login: (email: string, password: string) =>
      request<AuthResponse>("POST", "/auth/login", { email, password }, false),

    verifyOtp: (email: string, code: string, type: string, name?: string, password?: string) =>
      request<AuthResponse>("POST", "/auth/verify-otp", {
        email, code, type,
        ...(name ? { name } : {}),
        ...(password ? { password } : {}),
      }, false),

    resendOtp: (email: string, type: string) =>
      request<{ message: string; email: string }>("POST", "/auth/resend-otp", { email, type }, false),

    me: () => request<{ user: AuthResponse["user"] }>("GET", "/auth/me"),

    updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) =>
      request<{ user: AuthResponse["user"] }>("PATCH", "/auth/me", data),

    forgotPassword: (email: string) =>
      request<{ message: string; email: string }>("POST", "/auth/forgot-password", { email }, false),

    resetPassword: (email: string, code: string, newPassword: string) =>
      request<{ message: string }>("POST", "/auth/reset-password", { email, code, newPassword }, false),
  },

  // ── Links ────────────────────────────────────────────────────────────────────
  links: {
    list: (page = 1, limit = 20) =>
      request<PaginatedLinks>("GET", `/links?page=${page}&limit=${limit}`),

    get: (id: string) => request<{ link: LinkItem }>("GET", `/links/${id}`),

    create: (payload: CreateLinkPayload) =>
      request<{ link: LinkItem }>("POST", "/links", payload),

    update: (id: string, payload: UpdateLinkPayload) =>
      request<{ link: LinkItem }>("PATCH", `/links/${id}`, payload),

    delete: (id: string) => request<{ message: string }>("DELETE", `/links/${id}`),

    /** Get QR code as data URL (for embedding in frontend) */
    qrDataUrl: (id: string, size = 300) =>
      request<{ dataUrl: string; shortUrl: string }>("GET", `/links/${id}/qr/dataurl?size=${size}`),
  },

  // ── Analytics ────────────────────────────────────────────────────────────────
  analytics: {
    overview: () => request<OverviewStats>("GET", "/analytics/overview"),

    forLink: (id: string, days = 30) =>
      request<LinkAnalytics>("GET", `/analytics/links/${id}?days=${days}`),
  },

  // ── Dashboard ────────────────────────────────────────────────────────────────
  dashboard: {
    stats: () => request<DashboardStats>("GET", "/dashboard/stats"),
  },

  // ── Admin ────────────────────────────────────────────────────────────────────
  admin: {
    stats: () => request<AdminStats>("GET", "/admin/stats"),
    users: () => request<{ users: AdminUser[] }>("GET", "/admin/users"),
    userLinks: (id: string) => request<{ links: LinkItem[] }>("GET", `/admin/users/${id}/links`),
    updateUserStatus: (id: string, status: "active" | "suspended") => 
      request<{ message: string; user: AdminUser }>("PATCH", `/admin/users/${id}/status`, { status }),
    updateLinkStatus: (id: string, status: "active" | "disabled") =>
      request<{ message: string; link: LinkItem }>("PATCH", `/admin/links/${id}/status`, { status }),
  },
};
