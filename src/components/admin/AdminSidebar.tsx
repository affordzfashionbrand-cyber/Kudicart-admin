"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ADMIN_NAVIGATION: NavSection[] = [
  {
    title: "Core",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
      { name: "Users", href: "/admin/users", icon: "group" },
      { name: "Vendors", href: "/admin/vendors", icon: "storefront" },
      { name: "Categories", href: "/admin/categories", icon: "category" },
      { name: "Products", href: "/admin/products", icon: "inventory_2" },
    ],
  },
  {
    title: "Logistics & Fulfillment",
    items: [
      { name: "Orders", href: "/admin/orders", icon: "shopping_cart" },
      { name: "Delivery Partners", href: "/admin/delivery-partners", icon: "local_shipping" },
      { name: "Assignments", href: "/admin/assignments", icon: "assignment" },
    ],
  },
  {
    title: "Finance & Governance",
    items: [
      { name: "Payments", href: "/admin/payments", icon: "payments" },
      { name: "Ledger", href: "/admin/ledger", icon: "account_balance" },
      { name: "Reviews", href: "/admin/reviews", icon: "rate_review" },
      { name: "Support", href: "/admin/support", icon: "support_agent" },
    ],
  },
  {
    title: "System Control",
    items: [
      { name: "User & Access", href: "/admin/user-access", icon: "admin_panel_settings" },
      { name: "Reports", href: "/admin/reports", icon: "analytics" },
      { name: "Audit", href: "/admin/audit", icon: "history" },
      { name: "Notifications", href: "/admin/notifications", icon: "notifications" },
      { name: "Settings", href: "/admin/settings", icon: "settings" },
    ],
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isHoveringBrand, setIsHoveringBrand] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-40 border-r border-[#E4E0DB] bg-[#F4F1EA] flex flex-col justify-between shrink-0 transition-all duration-200 select-none",
          isOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]"
        )}
      >
        {/* Brand Area: Compact single row with integrated collapse/expand control */}
        <div
          className={cn(
            "h-16 border-b border-[#E4E0DB] bg-[#F4F1EA] flex items-center shrink-0 transition-all",
            isCollapsed ? "justify-center px-0" : "px-3.5 justify-between"
          )}
        >
          {isCollapsed ? (
            /* Collapsed Mode: Single centered K button. Swaps K for expand icon only when hovered */
            <button
              type="button"
              onClick={() => {
                setIsHoveringBrand(false);
                onToggleCollapse && onToggleCollapse();
              }}
              onMouseEnter={() => setIsHoveringBrand(true)}
              onMouseLeave={() => setIsHoveringBrand(false)}
              onFocus={() => setIsHoveringBrand(true)}
              onBlur={() => setIsHoveringBrand(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="relative w-8 h-8 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white flex items-center justify-center shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
            >
              {isHoveringBrand ? (
                /* On Hover: menu_open in opposite direction */
                <span
                  className="material-symbols-outlined text-[18px] scale-x-[-1]"
                  aria-hidden="true"
                >
                  menu_open
                </span>
              ) : (
                /* Default: White bold "K" only */
                <span className="font-bold text-sm select-none leading-none">
                  K
                </span>
              )}

              {/* Accessible hover tooltip */}
              {isHoveringBrand && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-[#111111] text-white text-[11px] font-normal rounded-[6px] whitespace-nowrap shadow-md z-50 hidden lg:block"
                >
                  Expand sidebar
                </div>
              )}
            </button>
          ) : (
            /* Expanded Mode: Brand on left, collapse button on far right */
            <>
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2.5 min-w-0 rounded-[6px] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F]"
                title="KudiCart Ops — Central Operations"
              >
                <div className="w-8 h-8 rounded-[8px] bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  K
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#111111] leading-tight tracking-tight truncate">
                    KudiCart Ops
                  </div>
                  <div className="text-[11px] font-normal text-[#6B6667] leading-tight truncate">
                    Central Operations
                  </div>
                </div>
              </Link>

              {/* Desktop Collapse Toggle */}
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="hidden lg:flex w-7 h-7 items-center justify-center rounded-[6px] text-[#6B6667] hover:text-[#111111] hover:bg-[#EBE7DF] transition-colors shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  menu_open
                </span>
              </button>
            </>
          )}
        </div>

        {/* Navigation Scroll Region */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 custom-scrollbar">
          {ADMIN_NAVIGATION.map((section) => (
            <div key={section.title}>
              {/* Section Header */}
              <div
                className={cn(
                  "px-2 pb-1 text-[10px] font-medium text-[#6B6667] uppercase tracking-wider",
                  isCollapsed && "lg:hidden"
                )}
              >
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));

                  return (
                    <div key={item.href} className="relative group">
                      <Link
                        href={item.href}
                        onClick={() => onClose && onClose()}
                        className={cn(
                          "flex items-center rounded-[8px] text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F]",
                          isCollapsed
                            ? "lg:w-10 lg:h-10 lg:justify-center lg:mx-auto px-3 py-2 gap-2.5"
                            : "px-3 py-2 gap-2.5",
                          isActive
                            ? "bg-[#FF5A1F] text-white font-medium shadow-xs"
                            : "text-[#6B6667] hover:text-[#111111] hover:bg-[#EBE7DF]"
                        )}
                        aria-label={item.name}
                      >
                        <span
                          className={cn(
                            "material-symbols-outlined text-[18px] shrink-0",
                            isActive ? "text-white" : "text-[#6B6667] group-hover:text-[#111111]"
                          )}
                          style={
                            isActive ? { fontVariationSettings: "'FILL' 1" } : undefined
                          }
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        <span className={cn("truncate", isCollapsed && "lg:hidden")}>
                          {item.name}
                        </span>
                      </Link>

                      {/* Accessible Tooltip when Collapsed on Desktop */}
                      {isCollapsed && (
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-[#111111] text-white text-[11px] font-normal rounded-[6px] whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 hidden lg:block"
                        >
                          {item.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Clean spacing at the bottom of the sidebar */}
        <div className="py-2" />
      </aside>
    </>
  );
}
