"use client";

import React, { useState } from "react";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { VendorHeader } from "@/components/vendor/VendorHeader";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* 260px Left Vendor Sidebar */}
      <VendorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by 260px on desktop) */}
      <div className="lg:pl-[260px] flex-1 flex flex-col min-h-screen">
        <VendorHeader onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 bg-[#F7F7F5]">
          {children}
        </main>
      </div>
    </div>
  );
}
