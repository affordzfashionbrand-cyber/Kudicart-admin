"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface VendorNavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

const VENDOR_NAVIGATION: VendorNavItem[] = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: "dashboard" },
  { name: "Profile", href: "/vendor/profile", icon: "storefront" },
  { name: "Products", href: "/vendor/products", icon: "inventory_2" },
  { name: "Orders", href: "/vendor/orders", icon: "shopping_cart", badge: "6" },
  { name: "Reviews", href: "/vendor/reviews", icon: "rate_review" },
  { name: "Reports", href: "/vendor/reports", icon: "analytics" },
  { name: "Settings", href: "/vendor/settings", icon: "settings" },
];

interface VendorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function VendorSidebar({ isOpen, onClose }: VendorSidebarProps) {
  const pathname = usePathname();

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
          "w-[260px] h-screen bg-[#F4F1EA] border-r border-[#E4E0DB] flex flex-col justify-between shrink-0 select-none z-40 fixed left-0 top-0 transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col">
          {/* Boutique & Platform Header */}
          <div className="h-16 px-4 flex items-center border-b border-[#E4E0DB] gap-2.5 bg-[#F4F1EA]">
            <div className="w-8 h-8 rounded-lg bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-base shadow-sm">
              K
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#111111] tracking-tight">
                KudiCart Ops
              </span>
              <span className="text-[10px] font-semibold text-[#6B6667] uppercase tracking-wider">
                Vendor Workspace
              </span>
            </div>
          </div>

          {/* Authenticated Vendor Boutique Identity Badge */}
          <div className="p-3.5 border border-[#E4E0DB] bg-white mx-3 my-3 rounded-lg shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#111111] truncate">
                Maison Lagos Atelier
              </span>
              <span
                className="material-symbols-outlined text-[#20885A] text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title="Certified Boutique"
              >
                verified
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#ECFDF5] text-[#20885A]">
                Certified Boutique
              </span>
              <span className="text-[10px] text-[#6B6667]">Bandra West Node</span>
            </div>
          </div>

          {/* Strictly Vendor-Scoped Navigation (7 routes) */}
          <nav className="px-2 space-y-0.5 mt-1">
            {VENDOR_NAVIGATION.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/vendor/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose && onClose()}
                  className={cn(
                    "relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-white text-[#D94B17] font-semibold shadow-xs border border-[#E4E0DB]"
                      : "text-[#6B6667] hover:text-[#111111] hover:bg-[#EBE7DF]"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FF5A1F] rounded-r-full" />
                  )}

                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "material-symbols-outlined text-[18px]",
                        isActive ? "text-[#FF5A1F]" : "text-[#6B6667]"
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
                        "inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                        isActive
                          ? "bg-[#FF5A1F] text-white"
                          : "bg-[#FFF0E8] text-[#D94B17]"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Operational Footer */}
        <div className="p-3 border-t border-[#E4E0DB] bg-[#F4F1EA]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#20885A] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#111111]">
              Fulfillment Link Synchronized
            </span>
          </div>
          <p className="font-mono text-[10px] text-[#6B6667] truncate">
            Store ID: VND-0492 • Tier 1 Vendor
          </p>
        </div>
      </aside>
    </>
  );
}
