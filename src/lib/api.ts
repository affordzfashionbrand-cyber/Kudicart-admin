/**
 * KudiCart Admin Production API Client
 * Centralized, typed HTTP client interfacing Kudicart-backend (/api/v1/admin/*)
 */

import type {
  CreateDarkStoreHubInput,
  CreateDarkStoreProductInput,
  DarkStoreHub,
  UpdateDarkStoreHubInput,
} from "../types/products";
import type {
  AdminCoupon,
  CreateCouponInput,
  UpdateCouponInput,
} from "../types/coupons";
import {
  getFreshFirebaseIdToken,
  signOutFirebase,
  subscribeFirebaseTokenRefresh,
} from "./firebase";
import { captureClientError } from "./sentry";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const TOKEN_KEY = "kudicart_admin_token";
const PROFILE_KEY = "kudicart_admin_profile";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string, rememberMe: boolean = true): void {
  if (typeof window === "undefined") return;
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
}

export function getStoredProfile(): any | null {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem(PROFILE_KEY) || sessionStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: any, rememberMe: boolean = true): void {
  if (typeof window === "undefined") return;
  if (rememberMe) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    sessionStorage.removeItem(PROFILE_KEY);
  } else {
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.removeItem(PROFILE_KEY);
  }
}

export type PortalRole = "ADMIN" | "VENDOR";

export function getPortalRole(profile: any): PortalRole | null {
  if (!profile || typeof profile !== "object") return null;
  const explicitPortal = String(profile.portalRole || "").toUpperCase();
  if (explicitPortal === "ADMIN" || explicitPortal === "VENDOR") {
    return explicitPortal as PortalRole;
  }

  const rawRole = String(profile.role || "").trim().toUpperCase();
  if (rawRole === "VENDOR") return "VENDOR";
  if (rawRole === "ADMIN" || Boolean(profile.adminId)) return "ADMIN";
  if (Boolean(profile.vendorId) || Boolean(profile.vendor)) return "VENDOR";
  if (rawRole && rawRole !== "CUSTOMER" && rawRole !== "DRIVER") {
    return "ADMIN";
  }
  return null;
}

function getRememberMePreference(): boolean {
  if (typeof window === "undefined") return true;
  if (sessionStorage.getItem(TOKEN_KEY)) return false;
  return true;
}

let refreshInFlight: Promise<string | null> | null = null;
let lastSyncedFirebaseIdToken: string | null = null;

async function exchangeFirebaseTokenWithBackend(
  idToken: string,
  portal: PortalRole
): Promise<string | null> {
  const endpoint =
    portal === "VENDOR"
      ? "/vendor/auth/firebase/login"
      : "/admin/auth/firebase/login";
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.token) return null;

    const rememberMe = getRememberMePreference();
    setAuthToken(data.token, rememberMe);
    if (data.user) {
      setStoredProfile(
        {
          ...data.user,
          portalRole: portal,
          ...(data.vendor !== undefined ? { vendor: data.vendor } : {}),
        },
        rememberMe
      );
    }
    lastSyncedFirebaseIdToken = idToken;
    return data.token;
  } catch {
    return null;
  }
}

export async function refreshSessionToken(
  forceRefresh: boolean = true
): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const portal = getPortalRole(getStoredProfile());
    if (!portal) return null;
    const freshIdToken = await getFreshFirebaseIdToken(forceRefresh);
    if (!freshIdToken) return null;
    return exchangeFirebaseTokenWithBackend(freshIdToken, portal);
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export function initAuthTokenRefreshListener(): () => void {
  if (typeof window === "undefined") return () => {};
  return subscribeFirebaseTokenRefresh((idToken) => {
    if (!idToken || idToken === lastSyncedFirebaseIdToken) return;
    const currentJwt = getAuthToken();
    const portal = getPortalRole(getStoredProfile());
    if (!currentJwt || !portal || refreshInFlight) return;
    void exchangeFirebaseTokenWithBackend(idToken, portal);
  });
}

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  hasRetried: boolean = false
): Promise<T> {
  const token = getAuthToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      if (
        !hasRetried &&
        !endpoint.includes("/auth/firebase/login") &&
        !endpoint.includes("/auth/login") &&
        !endpoint.includes("/auth/logout")
      ) {
        const refreshedToken = await refreshSessionToken(true);
        if (refreshedToken) {
          return request<T>(endpoint, options, true);
        }
      }
      clearAuthToken();
      void signOutFirebase();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
      throw new ApiError("Session expired or unauthorized.", 401);
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg =
        data.message ||
        (Array.isArray(data.message) ? data.message.join(", ") : null) ||
        `Request failed with status ${res.status}`;
      const apiErr = new ApiError(errorMsg, res.status, data);
      if (res.status >= 500) {
        captureClientError(apiErr, {
          endpoint,
          method: options.method || "GET",
          status: res.status,
        });
      }
      throw apiErr;
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    const networkErr = new ApiError(
      err?.message || "Network error. Please verify backend connectivity.",
      0
    );
    captureClientError(err instanceof Error ? err : networkErr, {
      endpoint,
      method: options.method || "GET",
      status: 0,
    });
    throw networkErr;
  }
}

export const api = {
  auth: {
    login: async (credentials: {
      email: string;
      password: string;
      rememberMe?: boolean;
    }) => {
      const { email, password, rememberMe = true } = credentials;
      const res = await request<{
        success: boolean;
        token: string;
        role?: string;
        user: {
          id: string;
          adminId?: string;
          email: string;
          name: string;
          role: string;
          avatarUrl?: string;
        };
      }>("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.token) {
        const portal =
          getPortalRole({ ...res.user, role: res.role || res.user?.role }) ||
          "ADMIN";
        setAuthToken(res.token, rememberMe);
        setStoredProfile({ ...res.user, portalRole: portal }, rememberMe);
      }
      return res;
    },
    loginAdminFirebase: async (idToken: string, rememberMe: boolean = true) => {
      const res = await request<{
        success: boolean;
        token: string;
        role?: string;
        user: Record<string, any>;
      }>("/admin/auth/firebase/login", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      if (res.token) {
        setAuthToken(res.token, rememberMe);
        setStoredProfile({ ...res.user, portalRole: "ADMIN" }, rememberMe);
      }
      return res;
    },
    loginFirebase: async (idToken: string, rememberMe: boolean = true) => {
      return api.auth.loginAdminFirebase(idToken, rememberMe);
    },
    getProfile: async () => {
      const res = await request<{
        id: string;
        adminId?: string;
        email: string;
        name: string;
        role: string;
        department?: string;
        status?: string;
        twoFactorEnabled?: boolean;
        lastLogin?: string;
        permissions?: string[];
      }>("/admin/auth/me");
      if (res) {
        setStoredProfile(
          { ...res, portalRole: "ADMIN" },
          getRememberMePreference()
        );
      }
      return { ...res, portalRole: "ADMIN" as const };
    },
    updateProfile: async (payload: { displayName?: string; email?: string }) => {
      return request<{
        success: boolean;
        user: Record<string, any>;
      }>("/admin/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    logout: async () => {
      try {
        await request("/admin/auth/logout", { method: "POST" });
      } finally {
        clearAuthToken();
        await signOutFirebase();
      }
    },
  },
  vendorAuth: {
    loginFirebase: async (idToken: string, rememberMe: boolean = true) => {
      const res = await request<{
        success: boolean;
        token: string;
        role?: string;
        user: Record<string, any>;
        vendor?: Record<string, any> | null;
      }>("/vendor/auth/firebase/login", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      if (res.token) {
        setAuthToken(res.token, rememberMe);
        setStoredProfile(
          {
            ...res.user,
            portalRole: "VENDOR",
            vendor: res.vendor ?? null,
          },
          rememberMe
        );
      }
      return res;
    },
    getProfile: async () => {
      const res = await request<{
        user: Record<string, any>;
        vendor: Record<string, any> | null;
      }>("/vendor/auth/me");
      if (res?.user) {
        setStoredProfile(
          {
            ...res.user,
            portalRole: "VENDOR",
            vendor: res.vendor ?? null,
          },
          getRememberMePreference()
        );
      }
      return { ...res, portalRole: "VENDOR" as const };
    },
    updateProfile: async (payload: {
      name?: string;
      phone?: string;
      storeName?: string;
      contactPerson?: string;
      address?: string;
    }) => {
      return request<{
        success: boolean;
        user: Record<string, any>;
        vendor: Record<string, any> | null;
      }>("/vendor/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    logout: async () => {
      try {
        await request("/vendor/auth/logout", { method: "POST" });
      } finally {
        clearAuthToken();
        await signOutFirebase();
      }
    },
  },

  dashboard: {
    getSummary: async (range: string = "today") => {
      return request<{
        operationalQueues: {
          unassignedOrders: number;
          pendingBoutiques: number;
          driverKyc: number;
        };
        metrics: {
          totalOrders: number;
          grossVolume: number;
          activeVendors: number;
          totalVendors: number;
          activeDeliveryFleet: number;
        };
        lifecyclePipeline: {
          placed: number;
          accepted: number;
          preparing: number;
          readyForPickup: number;
          assigned: number;
          pickedUp: number;
          inTransit: number;
          delivered: number;
        };
        recentOrders: any[];
      }>(`/admin/dashboard/summary?dateRange=${encodeURIComponent(range)}`);
    },
  },

  users: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/users${qs ? `?${qs}` : ""}`
      );
    },
    getById: async (id: string) => {
      return request<any>(`/admin/users/${id}`);
    },
    updateStatus: async (id: string, payload: { status: string; reason?: string }) => {
      return request<{ success: boolean; message: string; user: any }>(
        `/admin/users/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );
    },
  },

  vendors: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/vendors${qs ? `?${qs}` : ""}`
      );
    },
    getById: async (id: string) => {
      return request<any>(`/admin/vendors/${id}`);
    },
    approve: async (id: string) => {
      return request<{ success: boolean; vendor: any }>(
        `/admin/vendors/${id}/approve`,
        { method: "POST" }
      );
    },
    reject: async (id: string, reason: string) => {
      return request<{ success: boolean; vendor: any }>(
        `/admin/vendors/${id}/reject`,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
        }
      );
    },
    toggleSuspend: async (id: string, reason?: string) => {
      return request<{ success: boolean; vendor: any }>(
        `/admin/vendors/${id}/suspend`,
        {
          method: "PATCH",
          body: JSON.stringify({ reason }),
        }
      );
    },
  },

  categories: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number }>(
        `/admin/categories${qs ? `?${qs}` : ""}`
      );
    },
    create: async (data: any) => {
      return request<any>("/admin/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return request<any>(`/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<{ success: boolean }>(`/admin/categories/${id}`, {
        method: "DELETE",
      });
    },
  },

  hubs: {
    list: async (includeInactive: boolean = false) => {
      const qs = includeInactive ? "?includeInactive=true" : "";
      return request<{
        success: boolean;
        data: DarkStoreHub[];
        total: number;
      }>(`/admin/hubs${qs}`);
    },
    create: async (payload: CreateDarkStoreHubInput) => {
      return request<{
        success: boolean;
        message: string;
        data: DarkStoreHub;
      }>("/admin/hubs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update: async (id: string, payload: UpdateDarkStoreHubInput) => {
      return request<{
        success: boolean;
        message: string;
        data: DarkStoreHub;
      }>(`/admin/hubs/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    delete: async (id: string) => {
      return request<{
        success: boolean;
        message: string;
        data?: DarkStoreHub | null;
      }>(`/admin/hubs/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  },
  coupons: {
    list: async (params?: { search?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.status && params.status !== "ALL") query.set("status", params.status);
      const qs = query.toString();
      return request<{
        data: AdminCoupon[];
        total: number;
      }>(`/admin/coupons${qs ? `?${qs}` : ""}`);
    },
    create: async (payload: CreateCouponInput) => {
      return request<{
        success: boolean;
        message: string;
        coupon: AdminCoupon;
      }>("/admin/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update: async (id: string, payload: UpdateCouponInput) => {
      return request<{
        success: boolean;
        message: string;
        coupon: AdminCoupon;
      }>(`/admin/coupons/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    delete: async (id: string) => {
      return request<{
        success: boolean;
        message: string;
      }>(`/admin/coupons/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  },

  products: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/products${qs ? `?${qs}` : ""}`
      );
    },
    getById: async (id: string) => {
      return request<any>(`/admin/products/${id}`);
    },
    create: async (payload: CreateDarkStoreProductInput) => {
      return request<{
        success: boolean;
        message: string;
        product: any;
      }>("/admin/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateStatus: async (id: string, status: string) => {
      return request<any>(`/admin/products/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    updateStock: async (id: string, stock: number) => {
      return request<any>(`/admin/products/${id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stock }),
      });
    },
  },

  media: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<{
        success: boolean;
        message: string;
        url: string;
        filePath: string;
        size: number;
        mimetype: string;
      }>("/admin/media/upload", {
        method: "POST",
        body: formData,
      });
    },
  },

  orders: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/orders${qs ? `?${qs}` : ""}`
      );
    },
    getById: async (id: string) => {
      return request<any>(`/admin/orders/${id}`);
    },
    assignDriver: async (orderId: string, driverId: string) => {
      return request<{ success: boolean; order: any }>(
        `/admin/orders/${orderId}/assign-driver`,
        {
          method: "POST",
          body: JSON.stringify({ driverId }),
        }
      );
    },
  },

  assignments: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{
        data: any[];
        total: number;
        readyCount: number;
        assignedCount: number;
      }>(`/admin/assignments${qs ? `?${qs}` : ""}`);
    },
    assign: async (orderId: string, driverId: string) => {
      return request<{ success: boolean; order: any }>(
        `/admin/assignments/${orderId}/assign`,
        {
          method: "POST",
          body: JSON.stringify({ driverId }),
        }
      );
    },
  },

  deliveryPartners: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/delivery-partners${qs ? `?${qs}` : ""}`
      );
    },
    getById: async (id: string) => {
      return request<any>(`/admin/delivery-partners/${id}`);
    },
    reviewKyc: async (
      id: string,
      payload: { status: "APPROVED" | "REJECTED"; rejectionReason?: string }
    ) => {
      return request<{ success: boolean; partner?: any; driverId?: string; kycStatus?: string }>(
        `/admin/delivery-partners/${id}/kyc-review`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    updateStatus: async (id: string, status: string) => {
      return request<{ success: boolean; driver?: any }>(
        `/admin/delivery-partners/${id}/availability`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );
    },
  },

  payments: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/payments${qs ? `?${qs}` : ""}`
      );
    },
    getMetrics: async () => {
      return request<any>("/admin/payments/metrics");
    },
    getById: async (id: string) => {
      return request<any>(`/admin/payments/${id}`);
    },
    reconcile: async (payload?: {
      pendingThresholdMinutes?: number;
      expiryThresholdMinutes?: number;
    }) => {
      return request<{
        reconciledCount?: number;
        expiredCount?: number;
        checkedCount?: number;
        [key: string]: any;
      }>("/admin/payments/reconcile", {
        method: "POST",
        body: JSON.stringify(payload || {}),
      });
    },
  },

  ledger: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{
        data: any[];
        rawEntries?: any[];
        total: number;
        page?: number;
        limit?: number;
      }>(`/admin/ledger${qs ? `?${qs}` : ""}`);
    },
    getMetrics: async () => {
      return request<any>("/admin/ledger/metrics");
    },
    updateStatus: async (id: string, status: string) => {
      return request<{ success: boolean; entry: any }>(
        `/admin/ledger/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );
    },
  },

  reviews: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/reviews${qs ? `?${qs}` : ""}`
      );
    },
    moderate: async (id: string, status: string) => {
      return request<{ success: boolean; review: any }>(
        `/admin/reviews/${id}/moderate`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );
    },
    delete: async (id: string) => {
      return request<{ success: boolean }>(`/admin/reviews/${id}`, {
        method: "DELETE",
      });
    },
  },

  support: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/support/tickets${qs ? `?${qs}` : ""}`
      );
    },
    getById: async (id: string) => {
      return request<any>(`/admin/support/tickets/${id}`);
    },
    updateTicket: async (
      id: string,
      payload: { status?: string; assignee?: string; resolutionRemarks?: string }
    ) => {
      return request<{ success: boolean; ticket: any }>(
        `/admin/support/tickets/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );
    },
  },

  userAccess: {
    listUsers: async () => {
      return request<{ data: any[]; total: number }>("/admin/user-access/users");
    },
    inviteUser: async (payload: {
      name: string;
      email: string;
      role: string;
      department: string;
    }) => {
      return request<{ success: boolean; user: any }>(
        "/admin/user-access/users",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    updateRole: async (id: string, role: string) => {
      return request<{ success: boolean; user: any }>(
        `/admin/user-access/users/${id}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role }),
        }
      );
    },
    listRoles: async () => {
      return request<{ data: any[]; total: number }>("/admin/user-access/roles");
    },
    listPermissions: async () => {
      return request<{ data: any[]; total: number }>(
        "/admin/user-access/permissions"
      );
    },
    updatePermissions: async (payload: {
      roleId: string;
      permissions: Record<string, string[]>;
    }) => {
      return request<{ success: boolean; message?: string; data?: any }>(
        "/admin/user-access/permissions",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
    },
  },

  reports: {
    getMetrics: async (
      category: "ORDERS" | "VENDORS" | "DRIVERS" | "CATALOG" = "ORDERS",
      range: string = "THIS_MONTH"
    ) => {
      return request<any>(
        `/admin/reports/${encodeURIComponent(category)}?dateRange=${encodeURIComponent(range)}`
      );
    },
  },

  audit: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/audit${qs ? `?${qs}` : ""}`
      );
    },
  },

  notifications: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{
        data: any[];
        total: number;
        unreadCount: number;
      }>(`/admin/notifications${qs ? `?${qs}` : ""}`);
    },
    markAsRead: async (id: string) => {
      return request<{ success: boolean }>(`/admin/notifications/${id}/read`, {
        method: "PATCH",
      });
    },
    broadcast: async (payload: {
      title: string;
      message: string;
      scope: string;
      severity: string;
    }) => {
      return request<{ success: boolean; notification: any }>(
        "/admin/notifications/broadcast",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
  },

  settings: {
    getPreferences: async () => {
      return request<any>("/admin/settings/preferences");
    },
    savePreferences: async (prefs: any) => {
      return request<{ success: boolean; preferences: any }>(
        "/admin/settings/preferences",
        {
          method: "PUT",
          body: JSON.stringify(prefs),
        }
      );
    },
  },

  myNotifications: {
    list: async (params: { limit?: number; unreadOnly?: boolean; category?: string } = {}) => {
      const qs = new URLSearchParams();
      if (params.limit !== undefined) qs.set("limit", String(params.limit));
      if (params.unreadOnly) qs.set("unreadOnly", "true");
      if (params.category) qs.set("category", params.category);
      const q = qs.toString();
      return request<{ items: any[]; unreadCount: number; total: number }>(
        `/notifications${q ? `?${q}` : ""}`
      );
    },
    markRead: async (id: string) => {
      return request<{ success: boolean; notification: any }>(`/notifications/${id}/read`, {
        method: "PATCH",
      });
    },
    markAllRead: async () => {
      return request<{ success: boolean; updatedCount: number }>(`/notifications/read-all`, {
        method: "PATCH",
      });
    },
  },

  vendorOrders: {
    list: async (status?: string) => {
      const qs = status && status !== "ALL" ? `?status=${encodeURIComponent(status)}` : "";
      const res = await request<{ vendorId?: string | null; storeName?: string; orders?: any[] } | any[]>(
        `/vendor/orders${qs}`
      );
      if (Array.isArray(res)) {
        return { vendorId: null, storeName: "", orders: res };
      }
      return {
        vendorId: res?.vendorId ?? null,
        storeName: res?.storeName || "",
        orders: Array.isArray(res?.orders) ? res.orders : [],
      };
    },
    getById: async (id: string) => {
      return request<any>(`/vendor/orders/${id}`);
    },
    accept: async (id: string) => {
      return request<any>(`/vendor/orders/${id}/accept`, { method: "POST" });
    },
    prepare: async (id: string) => {
      return request<any>(`/vendor/orders/${id}/prepare`, { method: "POST" });
    },
    readyForPickup: async (id: string) => {
      return request<any>(`/vendor/orders/${id}/ready-for-pickup`, { method: "POST" });
    },
    reject: async (id: string, reason: string, expectedVersion?: number) => {
      return request<any>(`/vendor/orders/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason, expectedVersion }),
      });
    },
  },
};

export const adminApi = api;
