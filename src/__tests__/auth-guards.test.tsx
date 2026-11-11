import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: () => "/vendor/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

const firebaseMocks = vi.hoisted(() => ({
  signInFirebaseWithEmailPassword: vi.fn(),
  sendFirebasePasswordReset: vi.fn(),
  getFreshFirebaseIdToken: vi.fn(),
  subscribeFirebaseTokenRefresh: vi.fn(() => () => {}),
  signOutFirebase: vi.fn(async () => {}),
}));

vi.mock("@/lib/firebase", () => firebaseMocks);
vi.mock("@/lib/sentry", () => ({
  captureClientError: vi.fn(),
  initClientSentry: vi.fn(),
}));

import {
  api,
  ApiError,
  clearAuthToken,
  getAuthToken,
  getPortalRole,
  setAuthToken,
  setStoredProfile,
} from "@/lib/api";
import LoginPage from "@/app/login/page";
import AdminLayout from "@/app/admin/layout";
import VendorLayout from "@/app/vendor/layout";
import { VendorHeader } from "@/components/vendor/VendorHeader";

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("Wave 2 Auth, Refresh, Role Guards & Vendor Logout", () => {
  beforeEach(() => {
    clearAuthToken();
    vi.clearAllMocks();
  });

  it("normalizes Admin (including Super Admin sub-roles), Vendor, and rejects Customer/Driver", () => {
    expect(getPortalRole({ role: "ADMIN" })).toBe("ADMIN");
    expect(getPortalRole({ role: "Super Admin", adminId: "ADM-01" })).toBe("ADMIN");
    expect(getPortalRole({ role: "VENDOR", vendorId: "VND-01" })).toBe("VENDOR");
    expect(getPortalRole({ role: "CUSTOMER" })).toBeNull();
    expect(getPortalRole({ role: "DRIVER" })).toBeNull();
  });

  it("does NOT clear auth token or redirect on HTTP 403", async () => {
    setAuthToken("jwt-valid", true);
    setStoredProfile({ id: "u1", role: "VENDOR", portalRole: "VENDOR" }, true);

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(api.coupons.list()).rejects.toMatchObject({ statusCode: 403 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(getAuthToken()).toBe("jwt-valid");
  });

  it("refreshes Firebase ID token and retries once on HTTP 401", async () => {
    setAuthToken("expired-jwt", true);
    setStoredProfile(
      { id: "adm-1", role: "Super Admin", adminId: "ADM-1", portalRole: "ADMIN" },
      true
    );
    firebaseMocks.getFreshFirebaseIdToken.mockResolvedValueOnce("fresh-fb-token");

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            token: "new-backend-jwt",
            role: "ADMIN",
            user: { id: "adm-1", role: "Super Admin", adminId: "ADM-1" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [], total: 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const res = await api.coupons.list();
    expect(res).toEqual({ data: [], total: 0 });
    expect(firebaseMocks.getFreshFirebaseIdToken).toHaveBeenCalledWith(true);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(getAuthToken()).toBe("new-backend-jwt");
  });

  it("authenticates Admin via Firebase and routes Super Admin to /admin/dashboard", async () => {
    const user = userEvent.setup();
    firebaseMocks.signInFirebaseWithEmailPassword.mockResolvedValueOnce("fb-admin-tok");
    const adminSpy = vi
      .spyOn(api.auth, "loginAdminFirebase")
      .mockResolvedValueOnce({
        success: true,
        token: "adm-jwt",
        role: "ADMIN",
        user: { id: "a1", role: "Super Admin", adminId: "ADM-1" },
      });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/work email address/i), "ops@affordz.com");
    await user.type(screen.getByLabelText(/^password$/i), "Secret123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(firebaseMocks.signInFirebaseWithEmailPassword).toHaveBeenCalledWith(
        "ops@affordz.com",
        "Secret123!"
      );
      expect(adminSpy).toHaveBeenCalledWith("fb-admin-tok", false);
      expect(routerMock.push).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("falls back to vendor Firebase login on 403 and routes Vendor to /vendor/dashboard", async () => {
    const user = userEvent.setup();
    firebaseMocks.signInFirebaseWithEmailPassword.mockResolvedValueOnce("fb-vendor-tok");
    vi.spyOn(api.auth, "loginAdminFirebase").mockRejectedValueOnce(
      new ApiError("Admin portal access only", 403)
    );
    const vendorSpy = vi
      .spyOn(api.vendorAuth, "loginFirebase")
      .mockResolvedValueOnce({
        success: true,
        token: "vnd-jwt",
        role: "VENDOR",
        user: { id: "v1", role: "VENDOR", vendorId: "VND-1" },
        vendor: { id: "VND-1", storeName: "Atelier K" },
      });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/work email address/i), "boutique@affordz.com");
    await user.type(screen.getByLabelText(/^password$/i), "Vendor123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(vendorSpy).toHaveBeenCalledWith("fb-vendor-tok", false);
      expect(routerMock.push).toHaveBeenCalledWith("/vendor/dashboard");
    });
  });

  it("sends Firebase password reset email from Forgot password action", async () => {
    const user = userEvent.setup();
    firebaseMocks.sendFirebasePasswordReset.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/work email address/i), "ops@affordz.com");
    await user.click(screen.getByRole("button", { name: /forgot password/i }));

    await waitFor(() => {
      expect(firebaseMocks.sendFirebasePasswordReset).toHaveBeenCalledWith("ops@affordz.com");
      expect(screen.getByText(/Password reset link sent to ops@affordz\.com/i)).toBeInTheDocument();
    });
  });

  it("enforces AdminLayout and VendorLayout role guards", async () => {
    setAuthToken("tok", true);
    setStoredProfile({ id: "u1", role: "Super Admin", adminId: "ADM-1", portalRole: "ADMIN" }, true);

    render(
      <AdminLayout>
        <div>Admin Workspace Content</div>
      </AdminLayout>
    );
    expect(await screen.findByText("Admin Workspace Content")).toBeInTheDocument();

    render(
      <VendorLayout>
        <div>Vendor Workspace Content</div>
      </VendorLayout>
    );
    await waitFor(() => {
      expect(routerMock.replace).toHaveBeenCalledWith("/admin/dashboard");
    });
    expect(screen.queryByText("Vendor Workspace Content")).not.toBeInTheDocument();
  });

  it("VendorHeader Sign Out calls /vendor/auth/logout instead of admin logout", async () => {
    const user = userEvent.setup();
    setAuthToken("vnd-tok", true);
    setStoredProfile(
      { id: "v1", name: "Riya", email: "riya@store.com", role: "VENDOR", portalRole: "VENDOR" },
      true
    );

    vi.spyOn(api.vendorAuth, "getProfile").mockResolvedValueOnce({
      portalRole: "VENDOR",
      user: { id: "v1", name: "Riya", email: "riya@store.com", role: "VENDOR" },
      vendor: { id: "VND-1", storeName: "Studio Riya" },
    });
    vi.spyOn(api.vendorOrders, "list").mockResolvedValueOnce({
      orders: [],
      vendorId: "VND-1",
      storeName: "Studio Riya",
    });
    vi.spyOn(api.myNotifications, "list").mockResolvedValueOnce({
      items: [],
      unreadCount: 0,
      total: 0,
    });
    const vendorLogoutSpy = vi
      .spyOn(api.vendorAuth, "logout")
      .mockResolvedValueOnce(undefined);
    const adminLogoutSpy = vi.spyOn(api.auth, "logout");

    renderWithQuery(<VendorHeader onToggleSidebar={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /open profile menu/i }));
    await user.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(vendorLogoutSpy).toHaveBeenCalledTimes(1);
      expect(adminLogoutSpy).not.toHaveBeenCalled();
      expect(routerMock.replace).toHaveBeenCalledWith("/login");
    });
  });
});
