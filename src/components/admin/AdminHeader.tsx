"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MOCK_NOTIFICATIONS } from "@/mocks/notifications";
import { api, getStoredProfile, getAuthToken } from "@/lib/api";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  vendors: "Vendors",
  categories: "Categories",
  products: "Products",
  orders: "Orders",
  "delivery-partners": "Delivery Partners",
  assignments: "Assignments",
  payments: "Payments",
  ledger: "Ledger",
  reviews: "Reviews",
  support: "Support",
  "user-access": "User & Access",
  roles: "Roles",
  permissions: "Permissions",
  reports: "Reports",
  audit: "Audit",
  notifications: "Notifications",
  settings: "Settings",
};

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (!pathname || pathname === "/admin" || pathname === "/admin/dashboard") {
    return [];
  }

  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
    return [];
  }

  const items: BreadcrumbItem[] = [];
  let currentPath = "/admin";

  segments.forEach((segment, index) => {
    if (segment === "dashboard") return;
    currentPath += `/${segment}`;
    const isCurrent = index === segments.length - 1;
    const label =
      ROUTE_LABELS[segment] ||
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

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminHeader({
  onToggleSidebar,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Authenticated user identity for UI presentation
  const [userName, setUserName] = useState("Amara Okonkwo");
  const [userEmail, setUserEmail] = useState("amara@kudicart.com");
  const [liveNotifications, setLiveNotifications] = useState(MOCK_NOTIFICATIONS);

  useEffect(() => {
    // 1. Initial check from stored profile
    const stored = getStoredProfile();
    if (stored?.name) setUserName(stored.name);
    if (stored?.email) setUserEmail(stored.email);

    // 2. Fetch fresh profile and notification counts from backend
    if (getAuthToken()) {
      api.auth.getProfile()
        .then((profile) => {
          if (profile?.name) setUserName(profile.name);
          if (profile?.email) setUserEmail(profile.email);
        })
        .catch(() => {
          // Keep stored/fallback info
        });

      api.notifications.list({ limit: 5 })
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            setLiveNotifications(res.data);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Derive unread count from live notifications dataset
  const unreadCount = liveNotifications.filter((n) => !n.read).length;
  const recentNotifications = liveNotifications.slice(0, 3);

  const breadcrumbs = getBreadcrumbs(pathname || "");

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

  const handleSignOut = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignored
    }
    router.replace("/login");
  };

  const userInitials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-4 lg:px-6 bg-white border-b border-[#E4E0DB] gap-3 sm:gap-6">
      {/* Left: Mobile menu trigger & Breadcrumbs (when present, never Dashboard) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile navigation trigger (hidden on desktop) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          className="p-1.5 rounded-[6px] text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] lg:hidden transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Current Page Title / Route-Aware Breadcrumbs (only if non-empty, never shows Dashboard) */}
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B6667] min-w-0">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && <span className="text-[#D0CBC4] select-none text-[11px]">/</span>}
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
        )}
      </div>

      {/* Middle: Global Search (Fills available middle space) */}
      <div className="flex-1 max-w-3xl min-w-0 flex items-center">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#6B6667]">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
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
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Region C: Right — Notifications & Small Circular Profile Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 justify-end">
        {/* Compact Notifications Icon */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] transition-colors relative focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F]"
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
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
                <span className="text-xs font-semibold text-[#111111]">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium text-[#FF5A1F]">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <div className="divide-y divide-[#E4E0DB] text-xs">
                {recentNotifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.category === "KYC" ? "/admin/vendors" : "/admin/orders"}
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-3 block hover:bg-[#F7F7F5] transition-colors"
                  >
                    <p className="font-medium text-[#111111]">{notif.title}</p>
                    <p className="text-[11px] text-[#6B6667] mt-0.5 line-clamp-1">
                      {notif.messagePreview}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="p-2 border-t border-[#E4E0DB] text-center bg-[#F7F7F5]">
                <Link
                  href="/admin/notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs font-medium text-[#FF5A1F] hover:underline"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Small Circular Profile Avatar (Only) */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-[#FFF0E8] border border-[#FF5A1F]/30 flex items-center justify-center text-[#D94B17] font-medium text-xs hover:ring-2 hover:ring-[#FF5A1F]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] transition-all"
            aria-expanded={isProfileOpen}
            aria-label="Open profile menu"
            title="Open profile menu"
          >
            {userInitials || "AO"}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E4E0DB] rounded-[8px] shadow-md z-50 py-1 divide-y divide-[#E4E0DB] animate-fadeIn">
              <div className="px-3.5 py-2">
                <p className="text-xs font-semibold text-[#111111]">{userName}</p>
                <p className="text-[11px] text-[#6B6667]">{userEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-[#111111] hover:bg-[#F7F7F5] flex items-center gap-2 transition-colors font-normal"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#6B6667]">
                    settings
                  </span>
                  <span>Settings</span>
                </Link>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-[#DA1E28] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#DA1E28]">
                    logout
                  </span>
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
