"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";

interface OperationalQueuesProps {
  activeVendorsCount?: number;
  pendingBoutiquesCount?: number;
  activeFleetCount?: number;
  pendingDriverKycCount?: number;
}

export function OperationalQueues({
  activeVendorsCount = 0,
  pendingBoutiquesCount = 0,
  activeFleetCount = 0,
  pendingDriverKycCount = 0,
}: OperationalQueuesProps) {
  const vendorsQuery = useQuery({
    queryKey: ["admin-dashboard", "operational-vendors"],
    queryFn: async () => {
      const res = await api.vendors.list({ limit: 3 });
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 30_000,
  });

  const driversQuery = useQuery({
    queryKey: ["admin-dashboard", "operational-drivers"],
    queryFn: async () => {
      const res = await api.deliveryPartners.list({ limit: 3 });
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 30_000,
  });

  const vendors = vendorsQuery.data ?? [];
  const deliveryPartners = driversQuery.data ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
      {/* Column 1: Vendor Overview */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
            <div>
              <h3 className="text-[17px] font-semibold text-[#111111]">
                Vendor Overview
              </h3>
              <p className="text-xs text-[#6B6667] mt-0.5">
                {activeVendorsCount} active boutiques • {pendingBoutiquesCount} pending review
              </p>
            </div>
            <Link
              href="/admin/vendors"
              className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] inline-flex items-center gap-1 transition-colors"
            >
              <span>View all vendors</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* Concise Vendor Rows */}
          <div className="divide-y divide-[#E4E0DB]">
            {vendorsQuery.isLoading ? (
              <div className="py-6 text-xs text-[#6B6667] text-center">
                Loading vendor queue...
              </div>
            ) : vendorsQuery.isError ? (
              <div className="py-6 text-xs text-[#B91C1C] text-center">
                Unable to load vendor queue from backend.
              </div>
            ) : vendors.length === 0 ? (
              <div className="py-6 text-xs text-[#6B6667] text-center">
                No vendor stores found.
              </div>
            ) : (
              vendors.slice(0, 3).map((vendor: {
                id: string;
                storeName?: string;
                name?: string;
                primaryCategory?: string;
                category?: string;
                status?: string;
              }) => {
                const status = String(vendor.status || "ACTIVE").toUpperCase();
                return (
                  <div
                    key={vendor.id}
                    className="py-2.5 min-h-[52px] flex items-center justify-between hover:bg-[#F7F7F5]/50 px-1 rounded transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-[13px] font-medium text-[#111111] truncate">
                        {vendor.storeName || vendor.name || "Partner Store"}
                      </div>
                      <div className="text-xs text-[#6B6667] truncate mt-0.5">
                        {vendor.primaryCategory || vendor.category || "Marketplace Vendor"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <StatusBadge status={status} variant="vendor" />
                      <Link
                        href={`/admin/vendors/${vendor.id}`}
                        className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] px-2 py-0.5 rounded hover:bg-[#FFF0E8] transition-colors"
                      >
                        {status === "PENDING_REVIEW" ? "Review" : "View"}
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Column 2: Delivery Partners */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
            <div>
              <h3 className="text-[17px] font-semibold text-[#111111]">
                Delivery Partners
              </h3>
              <p className="text-xs text-[#6B6667] mt-0.5">
                {activeFleetCount} total fleet • {pendingDriverKycCount} awaiting verification
              </p>
            </div>
            <Link
              href="/admin/delivery-partners"
              className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] inline-flex items-center gap-1 transition-colors"
            >
              <span>Manage partners</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* Concise Delivery Partner Rows */}
          <div className="divide-y divide-[#E4E0DB]">
            {driversQuery.isLoading ? (
              <div className="py-6 text-xs text-[#6B6667] text-center">
                Loading delivery fleet...
              </div>
            ) : driversQuery.isError ? (
              <div className="py-6 text-xs text-[#B91C1C] text-center">
                Unable to load delivery partner queue from backend.
              </div>
            ) : deliveryPartners.length === 0 ? (
              <div className="py-6 text-xs text-[#6B6667] text-center">
                No delivery partners registered yet.
              </div>
            ) : (
              deliveryPartners.slice(0, 3).map((partner: {
                id: string;
                fullName?: string;
                name?: string;
                driverCode?: string;
                vehicleModel?: string;
                vehicleType?: string;
                kycStatus?: string;
              }) => {
                const kycStatus = String(partner.kycStatus || "PENDING").toUpperCase();
                const detailParts = [
                  partner.driverCode,
                  partner.vehicleModel || partner.vehicleType,
                ].filter(Boolean);
                return (
                  <div
                    key={partner.id}
                    className="py-2.5 min-h-[52px] flex items-center justify-between hover:bg-[#F7F7F5]/50 px-1 rounded transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-[13px] font-medium text-[#111111] truncate">
                        {partner.fullName || partner.name || "Delivery Partner"}
                      </div>
                      <div className="text-xs text-[#6B6667] truncate mt-0.5 font-mono">
                        {detailParts.join(" • ") || partner.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <StatusBadge status={kycStatus} variant="kyc" />
                      <Link
                        href={`/admin/delivery-partners/${partner.id}`}
                        className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] px-2 py-0.5 rounded hover:bg-[#FFF0E8] transition-colors"
                      >
                        {kycStatus === "PENDING" ? "Verify" : "View"}
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
