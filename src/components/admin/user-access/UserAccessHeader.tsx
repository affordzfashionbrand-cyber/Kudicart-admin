"use client";

import React from "react";
import Link from "next/link";
import { Shield, Users, Key, SlidersHorizontal } from "lucide-react";

interface UserAccessHeaderProps {
  activeTab: "users" | "roles" | "permissions";
}

export function UserAccessHeader({ activeTab }: UserAccessHeaderProps) {
  const tabs = [
    {
      id: "users",
      label: "Users",
      href: "/admin/user-access",
      icon: Users,
      count: "6",
    },
    {
      id: "roles",
      label: "Roles",
      href: "/admin/user-access/roles",
      icon: Key,
      count: "5",
    },
    {
      id: "permissions",
      label: "Permissions",
      href: "/admin/user-access/permissions",
      icon: SlidersHorizontal,
      count: "17 Modules",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              User &amp; Access
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#FFF0E8] text-[#D94B17] border border-[#FF5A1F]/20">
              System Control
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Manage Admin Accounts, Roles, And Module Permissions.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E0DB] pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-[8px] border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-[#FF5A1F] text-[#D94B17] bg-white font-semibold"
                  : "border-transparent text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FF5A1F]" : "text-[#6B6667]"}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive
                    ? "bg-[#FFF0E8] text-[#D94B17]"
                    : "bg-[#F4F1EA] text-[#6B6667]"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
