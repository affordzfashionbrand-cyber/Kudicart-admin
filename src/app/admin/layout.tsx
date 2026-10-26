"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* 260px Left Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by 260px on desktop) */}
      <div className="lg:pl-[260px] flex-1 flex flex-col min-h-screen">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 bg-[#F7F7F5]">
          {children}
        </main>
      </div>
    </div>
  );
}
