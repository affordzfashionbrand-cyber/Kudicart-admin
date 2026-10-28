"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Store,
  ChevronDown,
} from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

const VENDOR_ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  profile: "Boutique Profile",
  products: "Products",
  orders: "Orders",
  reviews: "Reviews",
  reports: "Reports",
  settings: "Settings",
};

function getVendorBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (!pathname || pathname === "/vendor" || pathname === "/vendor/dashboard") {
    return [];
  }

  const segments = pathname.replace(/^\/vendor\/?/, "").split("/").filter(Boolean);
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
    return [];
  }

  const items: BreadcrumbItem[] = [];
  let currentPath = "/vendor";

  segments.forEach((segment, index) => {
    if (segment === "dashboard") return;
    currentPath += `/${segment}`;
    const isCurrent = index === segments.length - 1;
    const label =
      VENDOR_ROUTE_LABELS[segment] ||
      (segment.length > 14
        ? `${segment.slice(0, 12)}…`
        : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));

    items.push({
      label,
      href: currentPath,
      isCurrent,
    });
  });

  return items;
}

const MOCK_VENDOR_NOTIFICATIONS = [
  {
    id: "vn-1",
    title: "New Order Placed #KC-98210",
    desc: "2x Silk Kaftan Dress received. Ready for preparation.",
    href: "/vendor/orders",
  },
  {
    id: "vn-2",
    title: "Low Stock Alert: Structured Linen Blazer",
    desc: "Remaining quantity is 3 units in Raw Chalk (38).",
    href: "/vendor/products",
  },
  {
    id: "vn-3",
    title: "New 5-Star Customer Review",
    desc: "Praise received for Handloom Tussar Sari.",
    href: "/vendor/reviews",
  },
];

interface VendorHeaderProps {
  onToggleSidebar?: () => void;
}

export function VendorHeader({ onToggleSidebar }: VendorHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Authenticated boutique staff identity
  const [vendorName] = useState("Folake Balogun");
  const [storeName] = useState("Maison Lagos Atelier");
  const [unreadCount] = useState(2);

  const breadcrumbs = getVendorBreadcrumbs(pathname || "");

  // Click outside & Escape key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-4 lg:px-6 bg-white border-b border-[#E4E0DB] gap-3 sm:gap-6 shrink-0">
      {/* Left: Mobile menu trigger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile navigation trigger */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          className="p-1.5 rounded-[6px] text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] lg:hidden transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Route-Aware Breadcrumbs */}
        {breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B6667] min-w-0">
            <Link href="/vendor/dashboard" className="hover:text-[#111111] transition-colors truncate">
              Vendor Portal
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href + idx}>
                <span className="text-[#D0CBC4] select-none text-[11px]">/</span>
                {crumb.isCurrent ? (
                  <span className="font-semibold text-[#111111] truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-[#111111] transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : (
          <div className="text-xs font-semibold text-[#111111]">
            Vendor Portal
          </div>
        )}
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-3xl min-w-0 flex items-center">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#6B6667]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or orders..."
            className="w-full h-[36px] pl-9 pr-8 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-[#111111] placeholder:text-[#6B6667]/70 focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all font-normal"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-2.5 flex items-center text-[#6B6667] hover:text-[#111111]"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Notifications & Profile Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 justify-end">
        {/* Compact Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] transition-colors relative focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F]"
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5A1F]"
                aria-hidden="true"
              />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E4E0DB] rounded-[8px] shadow-md z-50 overflow-hidden animate-fadeIn">
              <div className="px-3.5 py-2.5 border-b border-[#E4E0DB] flex items-center justify-between bg-[#F7F7F5]">
                <span className="text-xs font-semibold text-[#111111]">Store Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium text-[#FF5A1F]">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <div className="divide-y divide-[#E4E0DB] text-xs">
                {MOCK_VENDOR_NOTIFICATIONS.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.href}
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-3 block hover:bg-[#F7F7F5] transition-colors"
                  >
                    <p className="font-medium text-[#111111]">{notif.title}</p>
                    <p className="text-[11px] text-[#6B6667] mt-0.5 line-clamp-1">
                      {notif.desc}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="p-2 border-t border-[#E4E0DB] text-center bg-[#F7F7F5]">
                <Link
                  href="/vendor/orders"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs font-medium text-[#FF5A1F] hover:underline"
                >
                  View all orders →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Small Circular Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-[#FFF0E8] border border-[#FF5A1F]/30 flex items-center justify-center text-[#D94B17] font-medium text-xs hover:ring-2 hover:ring-[#FF5A1F]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] transition-all"
            aria-expanded={isProfileOpen}
            aria-label="Open profile menu"
            title="Open profile menu"
          >
            FB
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E4E0DB] rounded-[8px] shadow-md z-50 py-1 divide-y divide-[#E4E0DB] animate-fadeIn">
              <div className="px-3.5 py-2">
                <p className="text-xs font-semibold text-[#111111]">{vendorName}</p>
                <p className="text-[11px] text-[#6B6667] truncate">{storeName}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/vendor/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-[#111111] hover:bg-[#F7F7F5] flex items-center gap-2 transition-colors font-normal"
                >
                  <Store className="w-3.5 h-3.5 text-[#6B6667]" />
                  <span>Store Profile</span>
                </Link>
                <Link
                  href="/vendor/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-[#111111] hover:bg-[#F7F7F5] flex items-center gap-2 transition-colors font-normal"
                >
                  <Settings className="w-3.5 h-3.5 text-[#6B6667]" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-[#DA1E28] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#DA1E28]" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
