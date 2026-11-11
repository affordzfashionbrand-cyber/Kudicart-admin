"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { ActionRequiredRibbon } from "@/components/admin/dashboard/ActionRequiredRibbon";
import { MarketplaceMetricsGrid } from "@/components/admin/dashboard/MarketplaceMetricsGrid";
import { OrderLifecyclePipeline } from "@/components/admin/dashboard/OrderLifecyclePipeline";
import { OperationalQueues } from "@/components/admin/dashboard/OperationalQueues";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";
import { FinancialHealthSnapshot } from "@/components/admin/dashboard/FinancialHealthSnapshot";
import { api } from "@/lib/api";

const EMPTY_PIPELINE = {
  placed: 0,
  accepted: 0,
  preparing: 0,
  readyForPickup: 0,
  assigned: 0,
  pickedUp: 0,
  inTransit: 0,
  delivered: 0,
  returning: 0,
  returned: 0,
  cancelled: 0,
  failed: 0,
};

export default function AdminDashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ["admin-dashboard", "today"],
    queryFn: () => api.dashboard.getSummary("today") as Promise<any>,
    refetchInterval: 30_000,
  });

  const res = summaryQuery.data;

  const operationalQueues = {
    unassignedOrders:
      res?.actionRequired?.unassignedCount ??
      res?.operationalQueues?.readyForPickup ??
      res?.operationalQueues?.unassignedOrders ??
      0,
    pendingBoutiques:
      res?.actionRequired?.pendingBoutiquesCount ??
      res?.operationalQueues?.pendingBoutiques ??
      0,
    driverKyc:
      res?.actionRequired?.driverKycCount ??
      res?.operationalQueues?.pendingDrivers ??
      res?.operationalQueues?.driverKyc ??
      0,
  };

  const metrics = {
    totalOrders: res?.metrics?.totalOrders ?? 0,
    grossVolume:
      res?.metrics?.grossVolume ??
      res?.metrics?.gov ??
      res?.financialHealth?.grossVolume ??
      0,
    activeVendors: res?.metrics?.activeVendors ?? 0,
    totalVendors: res?.metrics?.totalVendors ?? 0,
    activeDeliveryFleet:
      res?.metrics?.activeDeliveryFleet ??
      res?.metrics?.deliveryFleetCount ??
      0,
  };

  const lifecyclePipeline = {
    ...EMPTY_PIPELINE,
    ...(res?.lifecyclePipeline ?? res?.pipelineCounts ?? {}),
  };

  const recentOrders = Array.isArray(res?.recentOrders)
    ? res.recentOrders
    : [];

  return (
    <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8">
      <div className="mb-3 sm:mb-3.5">
        <DashboardHeader />
      </div>

      {summaryQuery.isError && (
        <div className="mb-4 p-3.5 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#B91C1C]">
          <span>
            {(summaryQuery.error as any)?.message ||
              "Unable to fetch live dashboard summary from backend."}
          </span>
          <button
            type="button"
            onClick={() => summaryQuery.refetch()}
            className="h-7 px-3 rounded-[6px] bg-white border border-[#FECACA] font-medium hover:bg-[#FEF2F2] self-start sm:self-auto"
          >
            Retry
          </button>
        </div>
      )}

      <div className="space-y-4 sm:space-y-5">
        <ActionRequiredRibbon
          unassignedCount={operationalQueues.unassignedOrders}
          pendingBoutiquesCount={operationalQueues.pendingBoutiques}
          driverKycCount={operationalQueues.driverKyc}
        />

        <MarketplaceMetricsGrid
          totalOrders={metrics.totalOrders}
          gov={metrics.grossVolume}
          activeVendors={metrics.activeVendors}
          totalVendors={metrics.totalVendors}
          deliveryFleetCount={metrics.activeDeliveryFleet}
        />

        <OrderLifecyclePipeline pipelineCounts={lifecyclePipeline} />

        <OperationalQueues
          activeVendorsCount={metrics.activeVendors}
          pendingBoutiquesCount={operationalQueues.pendingBoutiques}
          activeFleetCount={metrics.activeDeliveryFleet}
          pendingDriverKycCount={operationalQueues.driverKyc}
        />

        <RecentOrdersTable orders={recentOrders} />

        <FinancialHealthSnapshot
          grossVolume={metrics.grossVolume}
          recordedTransactions={
            res?.financialHealth?.recordedTransactions ?? metrics.totalOrders
          }
        />
      </div>
    </div>
  );
}
