"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface VendorHeaderProps {
  onToggleSidebar?: () => void;
}

export function VendorHeader({ onToggleSidebar }: VendorHeaderProps) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  const getBreadcrumbs = () => {
    const segment = pathname?.replace("/vendor/", "") || "Dashboard";
    const formattedSegment = segment.charAt(0).toUpperCase() + segment.slice(1);
    return [
      { label: "Vendor Portal", href: "/vendor/dashboard" },
      { label: "Maison Lagos Atelier", href: "/vendor/dashboard" },
      { label: formattedSegment, href: pathname || "#", isCurrent: true },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E4E0DB] px-4 lg:px-8 flex items-center justify-between shrink-0">
      {/* Breadcrumbs & Quick Search Trigger */}
      <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-2xl">
        <button
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] lg:hidden"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#6B6667]">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label + idx}>
              {idx > 0 && <span className="text-[#E4E0DB]">/</span>}
              {crumb.isCurrent ? (
                <span className="text-[#D94B17] font-semibold">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-[#111111] transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="relative w-full max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6B6667] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search products or orders..."
            className="w-full h-9 pl-9 pr-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg text-xs placeholder:text-[#6B6667] focus:outline-none focus:bg-white focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all"
          />
          <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Controls: Status Toggle, Notifications, Vendor Profile */}
      <div className="flex items-center gap-3">
        {/* Store Status Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            isOnline
              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#20885A]"
              : "bg-[#F7F7F5] border-[#E4E0DB] text-[#6B6667]"
          }`}
          title="Click to toggle store availability"
        >
          <span className="relative flex h-2 w-2">
            {isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20885A] opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isOnline ? "bg-[#20885A]" : "bg-[#6B6667]"
              }`}
            />
          </span>
          <span className="text-[11px] font-semibold hidden sm:inline">
            {isOnline ? "Accepting Orders (Online)" : "Paused (Offline)"}
          </span>
          <span className="material-symbols-outlined text-[15px]">tune</span>
        </button>

        {/* Order Alert Notifications */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F4F1EA] text-[#6B6667] transition-colors"
          title="Order Notifications"
          aria-label="Order Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5A1F] ring-2 ring-white" />
        </button>

        <div className="h-5 w-px bg-[#E4E0DB] hidden sm:block" />

        {/* Authenticated Vendor Profile */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#FFF0E8] border border-[#FF5A1F]/30 flex items-center justify-center text-[#D94B17] font-semibold text-xs overflow-hidden">
            FB
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#111111] leading-none">
              Folake Balogun
            </span>
            <span className="text-[10px] text-[#6B6667] mt-0.5">Store Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
