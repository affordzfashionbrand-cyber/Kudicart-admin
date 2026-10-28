"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
