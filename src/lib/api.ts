/**
 * KudiCart Admin Production API Client
 * Centralized, typed HTTP client interfacing Kudicart-backend (/api/v1/admin/*)
 */

import type { CreateDarkStoreProductInput, DarkStoreHub } from "../types/products";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const TOKEN_KEY = "kudicart_admin_token";
const PROFILE_KEY = "kudicart_admin_profile";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function getStoredProfile(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
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
  options: RequestInit = {}
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
      clearAuthToken();
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
      throw new ApiError(errorMsg, res.status, data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err?.message || "Network error. Please verify backend connectivity.",
      0
    );
  }
}

export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const res = await request<{
        success: boolean;
        token: string;
        user: { id: string; email: string; name: string; role: string; avatarUrl?: string };
      }>("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      if (res.token) {
        setAuthToken(res.token);
        setStoredProfile(res.user);
      }
      return res;
    },
    getProfile: async () => {
      const res = await request<{
        id: string;
        email: string;
        name: string;
        role: string;
        permissions: string[];
      }>("/admin/auth/me");
      if (res) {
        setStoredProfile(res);
      }
      return res;
    },
    logout: async () => {
      try {
        await request("/admin/auth/logout", { method: "POST" });
      } finally {
        clearAuthToken();
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
          method: "POST",
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
        method: "PUT",
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
    list: async () => {
      return request<{
        success: boolean;
        data: DarkStoreHub[];
        total: number;
      }>("/admin/hubs");
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
      return request<{ success: boolean; partner: any }>(
        `/admin/delivery-partners/${id}/kyc`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    updateStatus: async (id: string, status: string) => {
      return request<{ success: boolean; partner: any }>(
        `/admin/delivery-partners/${id}/status`,
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
  },

  ledger: {
    list: async (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: any[]; total: number; page: number; limit: number }>(
        `/admin/ledger${qs ? `?${qs}` : ""}`
      );
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
        `/admin/reviews/${id}/status`,
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
        `/admin/support${qs ? `?${qs}` : ""}`
      );
    },
    getById: async (id: string) => {
      return request<any>(`/admin/support/${id}`);
    },
    updateTicket: async (
      id: string,
      payload: { status: string; resolutionNote?: string }
    ) => {
      return request<{ success: boolean; ticket: any }>(
        `/admin/support/${id}/status`,
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
  },

  reports: {
    getMetrics: async (range: string = "THIS_MONTH") => {
      return request<any>(`/admin/reports?dateRange=${encodeURIComponent(range)}`);
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
};
