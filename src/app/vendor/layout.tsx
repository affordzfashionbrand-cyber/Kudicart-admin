"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { VendorHeader } from "@/components/vendor/VendorHeader";
import { cn } from "@/lib/utils";
import { api, clearAuthToken, getAuthToken, getPortalRole, getStoredProfile } from "@/lib/api";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [authStatus, setAuthStatus] = useState<"checking" | "authorized" | "unauthorized">("checking");

  // Client-side authentication and role guard (VENDOR only) before rendering protected views
  useEffect(() => {
    let active = true;

    const verifyVendorAccess = async () => {
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

      if (portalRole === "VENDOR") {
        if (active) setAuthStatus("authorized");
        return;
      }

      if (portalRole === "ADMIN") {
        if (active) {
          setAuthStatus("unauthorized");
          router.replace("/admin/dashboard");
        }
        return;
      }

      try {
        const res = await api.vendorAuth.getProfile();
        if (!active) return;
        if (
          getPortalRole({
            ...res?.user,
            vendor: res?.vendor,
            portalRole: "VENDOR",
          }) === "VENDOR"
        ) {
          setAuthStatus("authorized");
          return;
        }
      } catch (err: any) {
        if (!active) return;
        const statusCode = err?.statusCode ?? err?.status;
        if (statusCode === 403) {
          setAuthStatus("unauthorized");
          router.replace("/admin/dashboard");
          return;
        }
      }

      clearAuthToken();
      if (active) {
        setAuthStatus("unauthorized");
        router.replace("/login");
      }
    };

    void verifyVendorAccess();
    return () => {
      active = false;
    };
  }, [router]);

  // Restore persistent collapsed preference from localStorage (expanded by default for fresh sessions)
  useEffect(() => {
    try {
      const sessionActive = sessionStorage.getItem("kudicart_vendor_session_active");
      if (!sessionActive) {
        sessionStorage.setItem("kudicart_vendor_session_active", "true");
        localStorage.removeItem("kudicart_vendor_sidebar_collapsed");
        setIsCollapsed(false);
        return;
      }

      const saved = localStorage.getItem("kudicart_vendor_sidebar_collapsed");
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
        localStorage.setItem("kudicart_vendor_sidebar_collapsed", String(next));
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
            Verifying vendor partner session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* Collapsible Left Vendor Sidebar */}
      <VendorSidebar
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
        <VendorHeader onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 bg-[#F7F7F5]">
          {children}
        </main>
      </div>
    </div>
  );
}
