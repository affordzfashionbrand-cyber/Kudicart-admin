"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Star,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const VENDOR_NAVIGATION: VendorNavItem[] = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/vendor/profile", icon: Store },
  { name: "Products", href: "/vendor/products", icon: Package },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingCart, badge: "4" },
  { name: "Reviews", href: "/vendor/reviews", icon: Star },
  { name: "Reports", href: "/vendor/reports", icon: BarChart3 },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
];

interface VendorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function VendorSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: VendorSidebarProps) {
  const pathname = usePathname();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isHoveringBrand, setIsHoveringBrand] = useState(false);

  return (
    <>
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
        <div className="flex flex-col min-w-0">
          {/* Brand Area */}
          <div
            className={cn(
              "h-16 border-b border-[#E4E0DB] bg-[#F4F1EA] flex items-center shrink-0 transition-all",
              isCollapsed ? "justify-center px-0" : "px-3.5 justify-between"
            )}
          >
            {isCollapsed ? (
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
                className="relative w-8 h-8 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white flex items-center justify-center shadow-2xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
              >
                {isHoveringBrand ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <span className="font-bold text-sm select-none leading-none">
                    K
                  </span>
                )}

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
              <>
                <Link
                  href="/vendor/dashboard"
                  className="flex items-center gap-2.5 min-w-0 rounded-[6px] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F]"
                  title="KudiCart Ops — Vendor Workspace"
                >
                  <div className="w-8 h-8 rounded-[8px] bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                    K
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-bold text-[#111111] tracking-tight leading-none truncate">
                      KudiCart Ops
                    </span>
                    <span className="text-[10px] font-medium text-[#6B6667] uppercase tracking-wider mt-1 truncate">
                      Vendor Workspace
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="hidden lg:flex w-7 h-7 rounded-[6px] text-[#6B6667] hover:text-[#111111] hover:bg-[#EAE6DE] items-center justify-center transition-colors shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Boutique Identity Card (Expanded mode only) */}
          {!isCollapsed && (
            <div className="p-3 border border-[#E4E0DB] bg-white mx-3 my-3 rounded-[8px] shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#111111] truncate">
                  Maison Lagos Atelier
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-[4px] text-[10px] font-medium bg-[#ECFDF5] text-[#20885A] shrink-0">
                  Certified
                </span>
              </div>
              <div className="text-[11px] text-[#6B6667]">
                Bandra West Node • Tier 1
              </div>
            </div>
          )}

          {/* Vendor Navigation Items */}
          <nav className={cn("space-y-0.5 mt-1", isCollapsed ? "px-2" : "px-2.5")}>
            {VENDOR_NAVIGATION.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/vendor/dashboard" && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => isCollapsed && setHoveredNav(item.name)}
                  onMouseLeave={() => isCollapsed && setHoveredNav(null)}
                >
                  <Link
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    className={cn(
                      "relative flex items-center rounded-[8px] text-xs font-medium transition-all",
                      isCollapsed
                        ? "h-10 w-10 mx-auto justify-center"
                        : "h-9 px-3 justify-between",
                      isActive
                        ? "bg-white text-[#D94B17] font-semibold shadow-2xs border border-[#E4E0DB]"
                        : "text-[#6B6667] hover:text-[#111111] hover:bg-[#EAE6DE]"
                    )}
                  >
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FF5A1F] rounded-r-full" />
                    )}

                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-[#FF5A1F]" : "text-[#6B6667]"
                        )}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold",
                          isActive
                            ? "bg-[#FF5A1F] text-white"
                            : "bg-[#FFF0E8] text-[#D94B17]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip in collapsed mode */}
                  {isCollapsed && hoveredNav === item.name && (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-[#111111] text-white text-[11px] font-medium rounded-[6px] whitespace-nowrap shadow-md z-50 hidden lg:block"
                    >
                      {item.name}
                      {item.badge && ` (${item.badge})`}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Operational Footer */}
        <div
          className={cn(
            "border-t border-[#E4E0DB] bg-[#F4F1EA]",
            isCollapsed ? "p-2 text-center" : "p-3"
          )}
        >
          {isCollapsed ? (
            <div
              className="w-2 h-2 rounded-full bg-[#20885A] mx-auto"
              title="Fulfillment Link Active"
            />
          ) : (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#111111] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
                <span>Fulfillment Link Active</span>
              </div>
              <p className="font-mono text-[10px] text-[#6B6667] mt-0.5 truncate">
                Store ID: VND-0492
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
