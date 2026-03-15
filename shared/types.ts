// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── Links ─────────────────────────────────────────────────────────────────────
export interface LinkItem {
  _id: string;
  userId: string;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  slug: string; // customAlias || shortCode
  title?: string;
  hasPassword: boolean;
  expiresAt?: string;
  isActive: boolean;
  status: "active" | "disabled";
  totalClicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLinkPayload {
  originalUrl: string;
  customAlias?: string;
  title?: string;
  password?: string;
  expiresAt?: string;
}

export interface UpdateLinkPayload {
  title?: string;
  originalUrl?: string;
  customAlias?: string | null;
  password?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface PaginatedLinks {
  links: LinkItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface DailyClick {
  date: string;
  clicks: number;
}

export interface BreakdownItem {
  name: string;
  value: number;
}

export interface ReferrerItem {
  referrer: string;
  clicks: number;
}

export interface OverviewStats {
  totalLinks: number;
  totalClicks: number;
  recentClicks: number;
  dailyClicks: DailyClick[];
}

export interface LinkAnalytics {
  link: {
    id: string;
    slug: string;
    originalUrl: string;
    title?: string;
    totalClicks: number;
    createdAt: string;
  };
  dailyClicks: DailyClick[];
  deviceBreakdown: BreakdownItem[];
  browserBreakdown: BreakdownItem[];
  osBreakdown: BreakdownItem[];
  topReferrers: ReferrerItem[];
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardRecentLink {
  _id: string;
  slug: string;
  title?: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
  isActive: boolean;
  isExpired: boolean;
}

export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  expiredLinks: number;
  recentLinks: DashboardRecentLink[];
}

// ── Admin ───────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
}

export interface AdminUser extends User {
  linkCount: number;
}
