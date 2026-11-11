"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";
import {
  api,
  clearAuthToken,
  getAuthToken,
  getPortalRole,
  getStoredProfile,
} from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [authStatus, setAuthStatus] = useState<"checking" | "authorized" | "unauthorized">("checking");

  // Client-side authentication and role guard (ADMIN only) before rendering protected views
  useEffect(() => {
    let active = true;

    const verifyAdminAccess = async () => {
      const token = getAuthToken();
      if (!token) {
        if (active) {
          setAuthStatus("unauthorized");
          router.replace("/login");
        }
        return;
      }

      const profile = getStoredProfile();
      const portalRole = getPortalRole(profile);

      if (portalRole === "ADMIN") {
        if (active) setAuthStatus("authorized");
        return;
      }

      if (portalRole === "VENDOR") {
        if (active) {
          setAuthStatus("unauthorized");
          router.replace("/vendor/dashboard");
        }
        return;
      }

      if (!portalRole) {
        try {
          const freshProfile = await api.auth.getProfile();
          const freshPortalRole = getPortalRole(freshProfile);
          if (!active) return;
          if (freshPortalRole === "ADMIN") {
            setAuthStatus("authorized");
            return;
          }
          if (freshPortalRole === "VENDOR") {
            setAuthStatus("unauthorized");
            router.replace("/vendor/dashboard");
            return;
          }
        } catch (err: any) {
          const statusCode = err?.statusCode ?? err?.status;
          if (active && statusCode === 403) {
            setAuthStatus("unauthorized");
            router.replace("/vendor/dashboard");
            return;
          }
          // Fall through to unauthorized redirect
        }
      }

      clearAuthToken();
      if (active) {
        setAuthStatus("unauthorized");
        router.replace("/login");
      }
    };

    verifyAdminAccess();
    return () => {
      active = false;
    };
  }, [router]);

  // Restore persistent collapsed preference from localStorage (expanded by default for fresh sessions)
  useEffect(() => {
    try {
      const sessionActive = sessionStorage.getItem("kudicart_admin_session_active");
      if (!sessionActive) {
        // Fresh session: initialize session and default to expanded
        sessionStorage.setItem("kudicart_admin_session_active", "true");
        localStorage.removeItem("kudicart_admin_sidebar_collapsed");
        setIsCollapsed(false);
        return;
      }

      const saved = localStorage.getItem("kudicart_admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("kudicart_admin_sidebar_collapsed", String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  if (authStatus !== "authorized") {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-7 h-7 rounded-full border-2 border-[#E4E0DB] border-t-[#FF5A1F] animate-spin" />
          <p className="text-xs font-medium text-[#6B6667]">
            Verifying administrator session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* Collapsible Left Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area — Offset dynamic to sidebar width on desktop */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-[padding] duration-200",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
        )}
      >
        <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 bg-[#F7F7F5]">
          {children}
        </main>
      </div>
    </div>
  );
}
