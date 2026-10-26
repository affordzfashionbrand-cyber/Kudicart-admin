"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();

  // Generate breadcrumb trail
  const getBreadcrumbs = () => {
    if (pathname?.startsWith("/admin/orders/")) {
      const orderId = pathname.split("/").pop();
      return [
        { label: "Central Operations", href: "/admin/orders" },
        { label: "Orders", href: "/admin/orders" },
        { label: `#${orderId}`, href: pathname, isCurrent: true },
      ];
    }
    if (pathname === "/admin/orders") {
      return [
        { label: "Central Operations", href: "/admin/orders" },
        { label: "Orders", href: "/admin/orders" },
        { label: "Marketplace Queue", href: "/admin/orders", isCurrent: true },
      ];
    }
    const segment = pathname?.replace("/admin/", "") || "Overview";
    const formattedSegment = segment.charAt(0).toUpperCase() + segment.slice(1);
    return [
      { label: "Central Operations", href: "/admin/orders" },
      { label: formattedSegment, href: pathname || "#", isCurrent: true },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-4 lg:px-8 bg-white border-b border-[#E4E0DB]">
      {/* Left: Mobile Toggle & Breadcrumbs & Search */}
      <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-2xl">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] lg:hidden"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Operational Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#6B6667] shrink-0">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label + idx}>
              {idx > 0 && <span className="text-[#E4E0DB]">/</span>}
              {crumb.isCurrent ? (
                <span className="text-[#111111] font-semibold">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-[#111111] transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Global Search Bar with ⌘K */}
        <div className="relative w-full max-w-xs lg:max-w-sm">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#6B6667]">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            type="text"
            placeholder="Search SKU, Order ID, Vendor or Rider..."
            className="w-full h-9 pl-9 pr-12 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg text-[#111111] placeholder:text-[#6B6667] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all"
          />
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#6B6667] bg-[#F4F1EA] border border-[#E4E0DB] rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls: Role Badge, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Active Role Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F1EA] border border-[#E4E0DB]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
          <span className="text-[11px] font-semibold text-[#111111]">
            Super Admin (Marketplace Wide)
          </span>
        </div>

        {/* Help Icon */}
        <button
          className="p-2 rounded-lg text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] transition-colors hidden sm:flex"
          title="Documentation & Operational Guide"
          aria-label="Documentation & Operational Guide"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] transition-colors"
          title="System Notifications"
          aria-label="System Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5A1F] text-[9px] font-bold text-white">
            3
          </span>
        </button>

        <div className="h-5 w-px bg-[#E4E0DB] hidden sm:block" />

        {/* Authenticated Profile */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#FFF0E8] border border-[#FF5A1F]/30 flex items-center justify-center text-[#D94B17] font-semibold text-xs shrink-0">
            AO
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-[#111111] leading-tight">
              Amara Okonkwo
            </div>
            <div className="text-[10px] text-[#6B6667] leading-tight">
              Chief Operations Lead
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
