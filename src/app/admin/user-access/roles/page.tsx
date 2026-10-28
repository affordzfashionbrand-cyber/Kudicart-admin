"use client";

import React from "react";
import { UserAccessHeader } from "@/components/admin/user-access/UserAccessHeader";
import { RolesListView } from "@/components/admin/user-access/RolesListView";

export default function AdminRolesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      <UserAccessHeader activeTab="roles" />
      <RolesListView />
    </div>
  );
}
