"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  badgeVariant?: "primary" | "warning" | "dot";
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
      {
        name: "Orders",
        href: "/admin/orders",
        icon: "shopping_cart",
        badge: "14 pending",
        badgeVariant: "primary",
      },
      {
        name: "Delivery Partners",
        href: "/admin/delivery-partners",
        icon: "local_shipping",
      },
      {
        name: "Assignments",
        href: "/admin/assignments",
        icon: "assignment",
        badgeVariant: "dot",
      },
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
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

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
          "fixed left-0 top-0 h-screen w-[260px] z-40 border-r border-[#E4E0DB] bg-[#F4F1EA] flex flex-col justify-between shrink-0 transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top Brand & Mode Header */}
        <div className="px-4 pt-4 pb-3 border-b border-[#E4E0DB] bg-[#F4F1EA]">
          <div className="flex items-center justify-between">
            <Link href="/admin/orders" className="flex items-center gap-2 group">
              {/* Logo Emblem */}
              <div className="w-8 h-8 rounded-lg bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-base shadow-sm">
                K
              </div>
              <div>
                <div className="text-base font-bold text-[#111111] leading-tight tracking-tight">
                  KudiCart Ops
                </div>
                <div className="text-[11px] font-semibold text-[#6B6667]">
                  Central Operations
                </div>
              </div>
            </Link>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FFF0E8] text-[#D94B17] tracking-wide border border-[#FF5A1F]/20">
              Super
            </span>
          </div>

          {/* Quick Action Button */}
          <Link
            href="/admin/orders"
            className="mt-3 w-full py-2 px-3 rounded-lg bg-[#FF5A1F] hover:bg-[#D94B17] text-white active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            <span>Dispatch Queue</span>
          </Link>
        </div>

        {/* Navigation Scroll Region */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
          {ADMIN_NAVIGATION.map((section) => (
            <div key={section.title}>
              <div className="px-2 pb-1 text-[10px] font-bold text-[#6B6667] uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose && onClose()}
                      className={cn(
                        "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
                        isActive
                          ? "bg-[#FF5A1F] text-white font-semibold shadow-sm"
                          : "text-[#6B6667] hover:text-[#111111] hover:bg-[#EBE7DF]"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "material-symbols-outlined text-[18px]",
                            isActive && "text-white"
                          )}
                          style={
                            isActive ? { fontVariationSettings: "'FILL' 1" } : undefined
                          }
                        >
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                            isActive
                              ? "bg-white text-[#FF5A1F]"
                              : "bg-[#FFF0E8] text-[#D94B17]"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {item.badgeVariant === "dot" && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with Engine Health */}
        <div className="p-3 border-t border-[#E4E0DB] bg-[#F4F1EA] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#111111] font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20885A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20885A]" />
              </span>
              <span className="text-[11px]">Central Engine: Normal</span>
            </div>
            <span className="font-mono text-[11px] text-[#6B6667]">99.98%</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6B6667] pt-0.5">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">monitor_heart</span>
              System Health
            </span>
            <span className="font-mono text-[10px] text-[#6B6667]">v2.4.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
