"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Bike,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  FilterX,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  X,
  ShoppingBag,
  Package,
  Phone,
  User,
  CreditCard,
  RefreshCw,
  Store,
} from "lucide-react";
import {
  DeliveryPartnerDetail,
  DriverDeliveryStats,
  DriverDeliveryRecord,
  DeliveryDetailResponse,
} from "@/types/drivers";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

type DeliveryFilterStatus =
  | "ALL"
  | "COMPLETED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "CANCELLED"
  | "FAILED";

export default function DeliveryPartnerDeliveryHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const partnerId = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  // Partner Profile State
  const [partner, setPartner] = useState<DeliveryPartnerDetail | null>(null);
  const [partnerLoading, setPartnerLoading] = useState<boolean>(true);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  // Delivery Statistics State
  const [stats, setStats] = useState<DriverDeliveryStats>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    cancelledDeliveries: 0,
    failedDeliveries: 0,
    assignedDeliveries: 0,
    successfulDeliveries: 0,
  });
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  // Deliveries Table State
  const [deliveries, setDeliveries] = useState<DriverDeliveryRecord[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState<boolean>(true);
  const [deliveriesTotal, setDeliveriesTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<DeliveryFilterStatus>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Detail Modal State
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [deliveryDetail, setDeliveryDetail] = useState<DeliveryDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Load Partner Profile
  const fetchPartner = useCallback(async () => {
    if (!partnerId) return;
    setPartnerLoading(true);
    setPartnerError(null);
    try {
      const data = await api.deliveryPartners.getById(partnerId);
      if (data && (data.id || data.fullName)) {
        setPartner(data);
      } else {
        setPartner(null);
        setPartnerError(`Delivery partner "${partnerId}" was not found.`);
      }
    } catch (err: any) {
      setPartner(null);
      setPartnerError(err?.message || "Failed to load delivery partner profile.");
    } finally {
      setPartnerLoading(false);
    }
  }, [partnerId]);

  // Load Statistics
  const fetchStats = useCallback(async () => {
    if (!partnerId) return;
    setStatsLoading(true);
    try {
      const data = await api.deliveryPartners.getDeliveryStats(partnerId);
      if (data && typeof data.totalDeliveries === "number") {
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load delivery statistics", err);
    } finally {
      setStatsLoading(false);
    }
  }, [partnerId]);

  // Load Deliveries
  const fetchDeliveries = useCallback(async () => {
    if (!partnerId) return;
    setDeliveriesLoading(true);
    try {
      const queryParams: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };
      if (statusFilter !== "ALL") {
        queryParams.status = statusFilter;
      }
      if (searchTerm.trim()) {
        queryParams.search = searchTerm.trim();
      }
      if (fromDate) {
        queryParams.from = fromDate;
      }
      if (toDate) {
        queryParams.to = toDate;
      }

      const res = await api.deliveryPartners.getDeliveries(partnerId, queryParams);
      setDeliveries(Array.isArray(res?.data) ? res.data : []);
      setDeliveriesTotal(res?.total || 0);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load deliveries", err);
      setDeliveries([]);
      setDeliveriesTotal(0);
      setTotalPages(1);
    } finally {
      setDeliveriesLoading(false);
    }
  }, [partnerId, currentPage, pageSize, statusFilter, searchTerm, fromDate, toDate]);

  useEffect(() => {
    fetchPartner();
    fetchStats();
  }, [fetchPartner, fetchStats]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Handle Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTerm(searchInput);
  };

  const handleClearFilters = () => {
    setStatusFilter("ALL");
    setSearchInput("");
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    statusFilter !== "ALL" || Boolean(searchTerm) || Boolean(fromDate) || Boolean(toDate);

  // Open Detail Modal
  const handleOpenDetail = async (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setDetailLoading(true);
    setDetailError(null);
    setDeliveryDetail(null);
    try {
      const data = await api.deliveryPartners.getDeliveryDetail(partnerId, deliveryId);
      setDeliveryDetail(data);
    } catch (err: any) {
      setDetailError(err?.message || "Failed to load individual delivery details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedDeliveryId(null);
    setDeliveryDetail(null);
    setDetailError(null);
  };

  if (partnerLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 text-xs text-[#6B6667]">
          <Link
            href="/admin/delivery-partners"
            className="hover:text-[#111111] flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery Partners</span>
          </Link>
          <span className="text-[#E4E0DB]">/</span>
          <span className="font-mono">Loading...</span>
        </div>
        <Skeleton className="w-full h-32 rounded-[10px]" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[10px]" />
          ))}
        </div>
        <Skeleton className="w-full h-48 rounded-[10px]" />
        <Skeleton className="w-full h-80 rounded-[10px]" />
      </div>
    );
  }

  if (partnerError || !partner) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 text-xs text-[#6B6667]">
          <Link
            href="/admin/delivery-partners"
            className="hover:text-[#111111] flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery Partners</span>
          </Link>
        </div>
        <EmptyState
          title="Delivery Partner Not Found"
          description={partnerError || "The requested delivery partner record could not be loaded."}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto pb-16">
      {/* ================= A. PAGE HEADER & BREADCRUMBS ================= */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#6B6667]">
          <Link
            href="/admin/delivery-partners"
            className="hover:text-[#111111] transition-colors flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Delivery Partners</span>
          </Link>
          <span className="text-[#E4E0DB]">/</span>
          <span className="text-[#111111] font-semibold">{partner.fullName}</span>
          <span className="text-[#E4E0DB]">/</span>
          <span className="text-[#FF5A1F] font-semibold">Delivery History</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#6B6667]">
            Partner ID: <strong className="text-[#111111] font-medium">{partner.driverCode || partner.id.slice(0, 8)}</strong>
          </span>
          <Link
            href={`/admin/delivery-partners/${partner.id}`}
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>KYC Details</span>
          </Link>
        </div>
      </div>

      {/* Primary Partner Identity Banner */}
      <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#111111] tracking-tight">{partner.fullName}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB]">
              {partner.driverCode || `DRV-${partner.id.slice(0, 4).toUpperCase()}`}
            </span>
            <StatusBadge status={partner.kycStatus} variant="kyc" />
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${
                partner.isOnline
                  ? "bg-[#ECFDF5] text-[#20885A] border-[#A7F3D0]"
                  : "bg-[#F7F7F5] text-[#6B6667] border-[#E4E0DB]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  partner.isOnline ? "bg-[#20885A]" : "bg-[#6B6667]"
                }`}
              />
              <span>{partner.isOnline ? "Online" : "Offline"}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#6B6667]">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#6B6667]" />
              <span className="font-mono text-[#111111]">{partner.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-[#6B6667]" />
              <span>
                Vehicle: <strong className="text-[#111111] font-medium">{partner.vehicleType || "Two-Wheeler"}</strong>
                {partner.vehicleModel ? ` (${partner.vehicleModel})` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>
                Plate: <strong className="font-mono text-[#111111] font-medium">{partner.vehicleRegistration || "Not Registered"}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => {
              fetchStats();
              fetchDeliveries();
            }}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E4E0DB] bg-white text-xs font-medium text-[#111111] hover:bg-[#F7F7F5] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6B6667]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ================= B. DELIVERY STATISTICS ================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
            Delivery Statistics
          </h2>
          <span className="text-xs text-[#6B6667]">Computed from actual partner dispatch records</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Deliveries */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B6667]">Total Deliveries</span>
              <div className="w-7 h-7 rounded-full bg-[#F4F1EA] text-[#111111] flex items-center justify-center">
                <Truck className="w-4 h-4 text-[#FF5A1F]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#111111] font-mono">
                {statsLoading ? "—" : stats.totalDeliveries}
              </div>
              <p className="text-[11px] text-[#6B6667] mt-0.5">Lifetime assigned orders</p>
            </div>
          </div>

          {/* Card 2: Completed Deliveries */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B6667]">Completed</span>
              <div className="w-7 h-7 rounded-full bg-[#ECFDF5] text-[#20885A] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#20885A] font-mono">
                {statsLoading ? "—" : stats.completedDeliveries}
              </div>
              <p className="text-[11px] text-[#6B6667] mt-0.5">Delivered to customers</p>
            </div>
          </div>

          {/* Card 3: Cancelled Deliveries */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B6667]">Cancelled</span>
              <div className="w-7 h-7 rounded-full bg-[#FEF2F2] text-[#E02D3C] flex items-center justify-center">
                <XCircle className="w-4 h-4 text-[#E02D3C]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#E02D3C] font-mono">
                {statsLoading ? "—" : stats.cancelledDeliveries}
              </div>
              <p className="text-[11px] text-[#6B6667] mt-0.5">Customer / admin cancelled</p>
            </div>
          </div>

          {/* Card 4: Failed Deliveries */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B6667]">Failed</span>
              <div className="w-7 h-7 rounded-full bg-[#FFFBEB] text-[#B45309] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-[#B45309]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#B45309] font-mono">
                {statsLoading ? "—" : stats.failedDeliveries}
              </div>
              <p className="text-[11px] text-[#6B6667] mt-0.5">Delivery failure recorded</p>
            </div>
          </div>

          {/* Card 5: Currently Assigned / In Progress */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B6667]">Assigned / In Progress</span>
              <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#2563EB]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#2563EB] font-mono">
                {statsLoading ? "—" : stats.assignedDeliveries}
              </div>
              <p className="text-[11px] text-[#6B6667] mt-0.5">Currently active or en route</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= C. DELIVERY PARTNER DETAILS ================= */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Delivery Partner Details
            </h2>
            <p className="text-xs text-[#6B6667] mt-0.5">
              Verified partner credentials, work preferences, and fleet configuration
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F4F1EA] text-[#6B6667]">
            {partner.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[#6B6667]">Full Name</span>
            <p className="font-semibold text-[#111111] text-sm">{partner.fullName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Partner ID</span>
            <p className="font-mono font-medium text-[#111111]">
              {partner.driverCode || `DRV-${partner.id.slice(0, 4).toUpperCase()}`}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Phone Number</span>
            <p className="font-mono font-medium text-[#111111]">{partner.phone}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Work Preference</span>
            <p className="font-medium text-[#111111]">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F4F1EA] text-[#111111]">
                {partner.workPreference === "FULL_TIME" ? "Full-time" : "Part-time"}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Vehicle Type</span>
            <p className="font-medium text-[#111111]">{partner.vehicleType || "Not configured"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Vehicle Model</span>
            <p className="font-medium text-[#111111]">{partner.vehicleModel || "Not configured"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Registration Number</span>
            <p className="font-mono font-medium text-[#111111]">
              {partner.vehicleRegistration || "Not registered"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Availability</span>
            <p className="font-medium text-[#111111]">
              {partner.isOnline ? "Online (Available for orders)" : "Offline"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Total Deliveries</span>
            <p className="font-mono font-bold text-[#111111]">{stats.totalDeliveries}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Successful Deliveries</span>
            <p className="font-mono font-bold text-[#20885A]">{stats.completedDeliveries}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">KYC Status</span>
            <div>
              <StatusBadge status={partner.kycStatus} variant="kyc" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6667]">Terminal Hub</span>
            <p className="font-medium text-[#111111]">{partner.terminalHub || "Central Operations Hub"}</p>
          </div>
        </div>
      </section>

      {/* ================= D & E. DELIVERY HISTORY TABLE & FILTERS ================= */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] shadow-xs overflow-hidden">
        {/* Table Header & Title */}
        <div className="p-4 sm:p-5 border-b border-[#E4E0DB] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#111111]">Delivery History</h2>
              <p className="text-xs text-[#6B6667]">
                Chronological list of all delivery orders dispatched to this partner
              </p>
            </div>
            <div className="text-xs text-[#6B6667]">
              Total Records: <strong className="text-[#111111]">{deliveriesTotal}</strong>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E4E0DB] pb-3 text-xs">
            {(
              [
                { label: "All Deliveries", value: "ALL" },
                { label: "Completed", value: "COMPLETED" },
                { label: "Assigned", value: "ASSIGNED" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Cancelled", value: "CANCELLED" },
                { label: "Failed", value: "FAILED" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                  statusFilter === tab.value
                    ? "bg-[#FF5A1F] text-white shadow-xs"
                    : "text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Date Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6667]" />
              <input
                type="text"
                placeholder="Search by Delivery ID, Order ID, or Customer..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] focus:bg-white text-xs text-[#111111] placeholder:text-[#6B6667] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] transition-all"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 border border-[#E4E0DB] rounded-[8px] px-2.5 py-1 bg-[#F7F7F5]">
                <Calendar className="w-3.5 h-3.5 text-[#6B6667]" />
                <span className="text-[11px] text-[#6B6667]">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs text-[#111111] focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-1.5 border border-[#E4E0DB] rounded-[8px] px-2.5 py-1 bg-[#F7F7F5]">
                <Calendar className="w-3.5 h-3.5 text-[#6B6667]" />
                <span className="text-[11px] text-[#6B6667]">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs text-[#111111] focus:outline-none font-mono"
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#E02D3C] hover:bg-[#FEF2F2] rounded-[6px] transition-colors"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}

              <div className="flex items-center gap-1 pl-2 border-l border-[#E4E0DB]">
                <span className="text-[11px] text-[#6B6667]">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-[#E4E0DB] rounded-[6px] py-1 px-2 bg-white text-xs text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Deliveries Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="py-2.5 px-4 font-medium">Delivery ID</th>
                <th className="py-2.5 px-3 font-medium">Order ID</th>
                <th className="py-2.5 px-3 font-medium">Customer</th>
                <th className="py-2.5 px-3 font-medium">Pickup Location</th>
                <th className="py-2.5 px-3 font-medium">Drop Location</th>
                <th className="py-2.5 px-3 font-medium">Assigned At</th>
                <th className="py-2.5 px-3 font-medium">Completed At</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Payment / Earnings</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {deliveriesLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`skel-row-${idx}`} className="h-12">
                    <td className="py-2 px-4">
                      <Skeleton className="w-24 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-20 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-28 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-32 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-32 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-28 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="w-28 h-4 rounded" />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Skeleton className="w-20 h-5 mx-auto rounded" />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Skeleton className="w-16 h-4 ml-auto rounded" />
                    </td>
                    <td className="py-2 px-4 text-right">
                      <Skeleton className="w-20 h-7 ml-auto rounded-[8px]" />
                    </td>
                  </tr>
                ))
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12">
                    <EmptyState
                      title={hasActiveFilters ? "No deliveries match filter criteria" : "No deliveries found"}
                      description={
                        hasActiveFilters
                          ? "Try clearing search keywords, adjusting date filters, or switching status tabs."
                          : "No deliveries have been recorded for this delivery partner yet."
                      }
                      actionLabel={hasActiveFilters ? "Clear All Filters" : undefined}
                      onAction={hasActiveFilters ? handleClearFilters : undefined}
                      icon="local_shipping"
                    />
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    className="h-12 hover:bg-[#F7F7F5]/60 transition-colors border-b border-[#E4E0DB]"
                  >
                    {/* Delivery ID */}
                    <td className="py-2 px-4">
                      <span className="font-mono font-semibold text-[#111111]">
                        {delivery.deliveryId}
                      </span>
                    </td>

                    {/* Order ID */}
                    <td className="py-2 px-3">
                      <span className="font-mono text-[#6B6667] text-[11px]">
                        #{delivery.orderId}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#111111]">
                          {delivery.customer?.name || "Customer"}
                        </span>
                        {delivery.customer?.phone && (
                          <span className="font-mono text-[11px] text-[#6B6667]">
                            {delivery.customer.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pickup Location */}
                    <td className="py-2 px-3 max-w-[180px]">
                      <div className="flex items-start gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#6B6667] shrink-0 mt-0.5" />
                        <span className="truncate text-[#111111]" title={delivery.pickupLocation}>
                          {delivery.pickupLocation}
                        </span>
                      </div>
                    </td>

                    {/* Drop Location */}
                    <td className="py-2 px-3 max-w-[200px]">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0 mt-0.5" />
                        <span className="truncate text-[#111111]" title={delivery.dropLocation}>
                          {delivery.dropLocation}
                        </span>
                      </div>
                    </td>

                    {/* Assigned At */}
                    <td className="py-2 px-3">
                      <span className="font-mono text-[11px] text-[#6B6667]">
                        {new Date(delivery.assignedAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </td>

                    {/* Completed At */}
                    <td className="py-2 px-3">
                      {delivery.completedAt ? (
                        <span className="font-mono text-[11px] text-[#20885A] font-medium">
                          {new Date(delivery.completedAt).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      ) : (
                        <span className="text-[#6B6667] text-center block">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3 text-center">
                      <StatusBadge status={delivery.status} variant="order" />
                    </td>

                    {/* Payment / Earnings */}
                    <td className="py-2 px-3 text-right">
                      <span className="font-mono font-semibold text-[#111111]">
                        ₹{Number(delivery.earnings || 40).toFixed(2)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(delivery.id)}
                        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {!deliveriesLoading && deliveries.length > 0 && (
          <div className="p-3 border-t border-[#E4E0DB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6667] bg-[#F4F1EA]">
            <div>
              Showing{" "}
              <strong className="text-[#111111]">
                {Math.min(deliveriesTotal, (currentPage - 1) * pageSize + 1)}
              </strong>{" "}
              to{" "}
              <strong className="text-[#111111]">
                {Math.min(deliveriesTotal, currentPage * pageSize)}
              </strong>{" "}
              of <strong className="text-[#111111]">{deliveriesTotal}</strong> deliveries
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 border border-[#E4E0DB] rounded-[8px] bg-white hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 text-[#111111]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="px-2 text-xs font-medium text-[#111111]">
                Page {currentPage} of {totalPages}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 border border-[#E4E0DB] rounded-[8px] bg-white hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 text-[#111111]"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ================= F. VIEW INDIVIDUAL DELIVERY DETAILS MODAL ================= */}
      {selectedDeliveryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[12px] border border-[#E4E0DB] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E4E0DB] flex items-center justify-between bg-[#F7F7F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#111111]">
                      {deliveryDetail?.deliveryId || "Delivery Details"}
                    </h3>
                    {deliveryDetail?.status && (
                      <StatusBadge status={deliveryDetail.status} variant="order" />
                    )}
                  </div>
                  <p className="text-xs text-[#6B6667] font-mono">
                    Order Number: #{deliveryDetail?.orderId || "—"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                className="w-8 h-8 rounded-[8px] border border-[#E4E0DB] bg-white text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#111111]">
              {detailLoading ? (
                <div className="space-y-4 py-8">
                  <Skeleton className="w-full h-24 rounded-[8px]" />
                  <Skeleton className="w-full h-36 rounded-[8px]" />
                  <Skeleton className="w-full h-40 rounded-[8px]" />
                </div>
              ) : detailError || !deliveryDetail ? (
                <div className="py-12 text-center text-[#E02D3C]">
                  {detailError || "Failed to load delivery details."}
                </div>
              ) : (
                <>
                  {/* Status Banner / Exceptions */}
                  {deliveryDetail.status === "CANCELLED" && (
                    <div className="p-3.5 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] text-[#E02D3C] space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>Delivery Cancelled</span>
                      </div>
                      <p className="text-xs text-[#B91C1C]">
                        Reason: {deliveryDetail.cancellationReason || "No specific cancellation reason provided."}
                      </p>
                      {deliveryDetail.cancelledAt && (
                        <p className="text-[11px] font-mono text-[#6B6667]">
                          Cancelled At: {new Date(deliveryDetail.cancelledAt).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  )}

                  {deliveryDetail.status === "FAILED" && (
                    <div className="p-3.5 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Delivery Attempt Failed</span>
                      </div>
                      <p className="text-xs text-[#92400E]">
                        Reason: {deliveryDetail.cancellationReason || "Customer unavailable or address unreachable."}
                      </p>
                    </div>
                  )}

                  {/* Customer & Route Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Info */}
                    <div className="p-4 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]/50 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                        <User className="w-3.5 h-3.5 text-[#6B6667]" />
                        <span>Customer Information</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#6B6667]">Name:</span>
                          <span className="font-medium text-[#111111]">{deliveryDetail.customer?.name || "Customer"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B6667]">Phone:</span>
                          <span className="font-mono text-[#111111]">{deliveryDetail.customer?.phone || "Not available"}</span>
                        </div>
                        {deliveryDetail.customer?.email && (
                          <div className="flex justify-between">
                            <span className="text-[#6B6667]">Email:</span>
                            <span className="font-mono text-[#111111]">{deliveryDetail.customer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assigned Partner */}
                    <div className="p-4 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5]/50 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                        <Bike className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>Assigned Partner</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#6B6667]">Partner:</span>
                          <span className="font-medium text-[#111111]">{deliveryDetail.partner?.fullName || "Assigned Partner"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B6667]">Partner Code:</span>
                          <span className="font-mono text-[#111111]">{deliveryDetail.partner?.driverCode || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B6667]">Contact:</span>
                          <span className="font-mono text-[#111111]">{deliveryDetail.partner?.phone || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route & Timestamps */}
                  <div className="p-4 rounded-[8px] border border-[#E4E0DB] space-y-3">
                    <h4 className="font-bold text-[#111111]">Locations & Transit Coordinates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[#6B6667]">
                          <Store className="w-3.5 h-3.5" />
                          <span className="font-medium">Pickup Location</span>
                        </div>
                        <p className="font-medium text-[#111111] bg-[#F7F7F5] p-2.5 rounded-[6px] border border-[#E4E0DB]">
                          {deliveryDetail.pickupLocation}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[#FF5A1F]">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="font-medium text-[#111111]">Drop-off Location</span>
                        </div>
                        <p className="font-medium text-[#111111] bg-[#F7F7F5] p-2.5 rounded-[6px] border border-[#E4E0DB]">
                          {deliveryDetail.dropLocation}
                        </p>
                      </div>
                    </div>

                    {deliveryDetail.deliveryInstructions && (
                      <div className="mt-2 text-xs bg-[#FFFBEB] p-2.5 rounded-[6px] border border-[#FDE68A] text-[#B45309]">
                        <strong>Instructions:</strong> {deliveryDetail.deliveryInstructions}
                      </div>
                    )}
                  </div>

                  {/* Financials & Payment Breakdown */}
                  <div className="p-4 rounded-[8px] border border-[#E4E0DB] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                      <CreditCard className="w-3.5 h-3.5 text-[#6B6667]" />
                      <span>Financial & Partner Earning Details</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="bg-[#F7F7F5] p-2.5 rounded-[6px]">
                        <span className="text-[#6B6667] block text-[11px]">Partner Earning</span>
                        <strong className="text-sm font-mono text-[#FF5A1F]">
                          ₹{Number(deliveryDetail.earnings || 40).toFixed(2)}
                        </strong>
                      </div>
                      <div className="bg-[#F7F7F5] p-2.5 rounded-[6px]">
                        <span className="text-[#6B6667] block text-[11px]">Item Total</span>
                        <strong className="text-sm font-mono text-[#111111]">
                          ₹{Number(deliveryDetail.itemTotal || 0).toFixed(2)}
                        </strong>
                      </div>
                      <div className="bg-[#F7F7F5] p-2.5 rounded-[6px]">
                        <span className="text-[#6B6667] block text-[11px]">Order Total</span>
                        <strong className="text-sm font-mono text-[#111111]">
                          ₹{Number(deliveryDetail.grandTotal || 0).toFixed(2)}
                        </strong>
                      </div>
                      <div className="bg-[#F7F7F5] p-2.5 rounded-[6px]">
                        <span className="text-[#6B6667] block text-[11px]">Payment Mode</span>
                        <strong className="text-xs font-mono text-[#111111]">
                          {deliveryDetail.paymentMethod} ({deliveryDetail.paymentStatus})
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Items in Delivery */}
                  {deliveryDetail.items && deliveryDetail.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#111111] flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#6B6667]" />
                        <span>Packages & Items ({deliveryDetail.items.length})</span>
                      </h4>
                      <div className="border border-[#E4E0DB] rounded-[8px] divide-y divide-[#E4E0DB] overflow-hidden">
                        {deliveryDetail.items.map((item) => (
                          <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-white">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-10 h-10 object-cover rounded-[6px] border border-[#E4E0DB]"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-[6px] bg-[#F4F1EA] flex items-center justify-center text-[#6B6667]">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-[#111111]">{item.title}</p>
                                <p className="text-[11px] text-[#6B6667]">
                                  Brand: {item.brand} • Size: {item.size} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono font-semibold text-[#111111]">
                              ₹{Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ================= 3. CHRONOLOGICAL STATUS TIMELINE ================= */}
                  <div className="p-4 rounded-[8px] border border-[#E4E0DB] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E4E0DB] pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#FF5A1F]" />
                        <h4 className="font-bold text-[#111111]">Chronological Delivery Status Timeline</h4>
                      </div>
                      <span className="text-[11px] text-[#6B6667]">
                        Recorded database events
                      </span>
                    </div>

                    <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E0DB]">
                      {deliveryDetail.timeline.map((event, idx) => {
                        const isLatest = idx === deliveryDetail.timeline.length - 1;
                        const isTerminalSuccess = event.status === "DELIVERED";
                        const isTerminalFailure = event.status === "CANCELLED" || event.status === "FAILED";

                        return (
                          <div key={event.id || idx} className="relative group">
                            {/* Marker dot */}
                            <div
                              className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isTerminalSuccess
                                  ? "bg-[#20885A] border-[#20885A] text-white"
                                  : isTerminalFailure
                                  ? "bg-[#E02D3C] border-[#E02D3C] text-white"
                                  : isLatest
                                  ? "bg-[#FF5A1F] border-[#FF5A1F] text-white"
                                  : "bg-white border-[#A8A29E] text-[#A8A29E]"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#111111]">
                                  {event.status.replace(/_/g, " ")}
                                </span>
                                {event.actorRole && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#6B6667]">
                                    {event.actorRole}
                                  </span>
                                )}
                              </div>

                              {event.note && (
                                <p className="text-xs text-[#6B6667]">{event.note}</p>
                              )}

                              <p className="text-[11px] font-mono text-[#A8A29E]">
                                {new Date(event.timestamp).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "medium",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E4E0DB] flex justify-end bg-[#F7F7F5]">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="h-8 px-4 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
