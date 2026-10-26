"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { ActionRequiredRibbon } from "@/components/admin/dashboard/ActionRequiredRibbon";
import { MarketplaceMetricsGrid } from "@/components/admin/dashboard/MarketplaceMetricsGrid";
import { OrderLifecyclePipeline } from "@/components/admin/dashboard/OrderLifecyclePipeline";
import { OperationalQueues } from "@/components/admin/dashboard/OperationalQueues";
import { FinancialHealthSnapshot } from "@/components/admin/dashboard/FinancialHealthSnapshot";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";

export default function AdminDashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  return (
    <div className="space-y-space-lg max-w-[1440px] mx-auto">
      {/* 1. Header with reporting period and refresh controls */}
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {/* 2. Action Required Ribbon (9 Critical Items) */}
      <ActionRequiredRibbon
        unassignedCount={4}
        pendingBoutiquesCount={3}
        driverKycCount={2}
      />

      {/* 3. Marketplace Performance High-Value Metrics (Volume, GOV, Active Stores, Fleet) */}
      <MarketplaceMetricsGrid
        totalOrders={148}
        gov={482450}
        activeVendors={42}
        totalVendors={48}
        pendingVendors={6}
        deliveryFleetCount={28}
        onDutyDrivers={19}
        standbyDrivers={9}
        queueExceptionsCount={9}
      />

      {/* 4. Order Operations & Canonical Lifecycle Pipeline */}
      <OrderLifecyclePipeline
        pipelineCounts={{
          placed: 12,
          accepted: 18,
          preparing: 24,
          readyForPickup: 14,
          assigned: 16,
          pickedUp: 22,
          inTransit: 19,
          delivered: 23,
        }}
      />

      {/* 5. Operational Queues (Vendor Applications & Delivery Partner Verifications) */}
      <OperationalQueues />

      {/* 6. Financial Health & Transaction Snapshot */}
      <FinancialHealthSnapshot
        grossVolume={482450}
        successRate={94.2}
        escrowRate={4.1}
        failureRate={1.7}
      />

      {/* 7. Recent Marketplace Orders */}
      <RecentOrdersTable />
    </div>
  );
}
