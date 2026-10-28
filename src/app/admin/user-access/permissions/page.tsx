"use client";

import React, { Suspense } from "react";
import { UserAccessHeader } from "@/components/admin/user-access/UserAccessHeader";
import { PermissionsMatrixView } from "@/components/admin/user-access/PermissionsMatrixView";

export default function AdminPermissionsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      <UserAccessHeader activeTab="permissions" />
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-[#6B6667] bg-white rounded-[10px] border border-[#E4E0DB]">
            Loading permission matrix...
          </div>
        }
      >
        <PermissionsMatrixView />
      </Suspense>
    </div>
  );
}
