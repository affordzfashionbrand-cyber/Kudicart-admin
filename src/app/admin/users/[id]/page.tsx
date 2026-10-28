"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CustomerUser } from "@/types/users";
import { getDemoCustomerById } from "@/demo-data/users";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

type DetailTab = "ORDERS" | "ADDRESSES" | "REVIEWS" | "TICKETS";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const customerId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<DetailTab>("ORDERS");
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadCustomer = () => {
    if (!customerId) return;
    setIsLoading(true);
    setError(null);

    const found = getDemoCustomerById(customerId);
    if (found) {
      setCustomer(found);
    } else {
      setCustomer(null);
      setError(`Customer record "${customerId}" was not found.`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleStatus = () => {
    if (!customer) return;
    setIsSuspendModalOpen(false);
    setToastMessage("Not connected in this build. Customer status modification requires backend connectivity.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8 space-y-4">
        <div className="h-6 w-32 bg-[#E4E0DB]/60 rounded animate-pulse" />
        <div className="h-28 bg-white border border-[#E4E0DB] rounded-[10px] p-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 h-96 bg-white border border-[#E4E0DB] rounded-[10px] animate-pulse" />
          <div className="lg:col-span-4 h-96 bg-white border border-[#E4E0DB] rounded-[10px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8">
        <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-12 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <h1 className="text-base font-semibold text-[#111111]">Customer Not Found</h1>
          <p className="text-xs text-[#6B6667]">
            {error || `No customer was found matching the identifier "${customerId}".`}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Link
              href="/admin/users"
              className="px-3.5 py-2 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium transition-colors"
            >
              Back to Users Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8 space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-3 rounded-[8px] shadow-lg flex items-center gap-3 border border-[#333333] text-xs">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#6B6667] hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header Action Card */}
      <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              {customer.name}
            </h1>
            <span className="font-mono text-xs bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#E4E0DB] text-[#6B6667] font-medium">
              {customer.customerNumber}
            </span>
            <StatusBadge status={customer.status} variant="user" />
          </div>
          <p className="text-xs text-[#6B6667]">
            Registered on {customer.registrationDate} • Marketplace Direct Customer
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsSuspendModalOpen(true)}
            className={cn(
              "px-3.5 py-2 rounded-[8px] border text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs",
              customer.status === "ACTIVE"
                ? "border-[#DA1E28]/30 bg-[#FEF2F2] hover:bg-[#DA1E28] hover:text-white text-[#DA1E28]"
                : "border-[#20885A]/30 bg-[#ECFDF5] hover:bg-[#20885A] hover:text-white text-[#20885A]"
            )}
          >
            <span>{customer.status === "ACTIVE" ? "Suspend Account" : "Reactivate Account"}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Main Column: Metrics & Tabs (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs">
              <span className="text-xs font-medium text-[#6B6667] block">
                Total Orders
              </span>
              <div className="mt-1 text-2xl font-semibold text-[#111111] tabular-nums">
                {customer.totalOrders}
              </div>
              <span className="text-xs text-[#6B6667] mt-0.5 block">Recorded checkouts</span>
            </div>

            <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs">
              <span className="text-xs font-medium text-[#6B6667] block">
                Total Spent
              </span>
              <div className="mt-1 text-2xl font-semibold text-[#111111] tabular-nums">
                ₹{customer.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-[#6B6667] mt-0.5 block">Lifetime order volume</span>
            </div>

            <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-xs font-medium text-[#6B6667] block">
                Saved Addresses
              </span>
              <div className="mt-1 text-2xl font-semibold text-[#111111] tabular-nums">
                {customer.addresses.length}
              </div>
              <span className="text-xs text-[#6B6667] mt-0.5 block">Delivery destinations</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-1 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-1 overflow-x-auto w-full">
              <button
                type="button"
                onClick={() => setActiveTab("ORDERS")}
                className={cn(
                  "px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0",
                  activeTab === "ORDERS"
                    ? "bg-[#111111] text-white"
                    : "text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA]"
                )}
              >
                <span>Orders ({customer.orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ADDRESSES")}
                className={cn(
                  "px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0",
                  activeTab === "ADDRESSES"
                    ? "bg-[#111111] text-white"
                    : "text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA]"
                )}
              >
                <span>Addresses ({customer.addresses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("REVIEWS")}
                className={cn(
                  "px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0",
                  activeTab === "REVIEWS"
                    ? "bg-[#111111] text-white"
                    : "text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA]"
                )}
              >
                <span>Reviews ({customer.reviews.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("TICKETS")}
                className={cn(
                  "px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0",
                  activeTab === "TICKETS"
                    ? "bg-[#111111] text-white"
                    : "text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA]"
                )}
              >
                <span>Support ({customer.tickets.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ORDER HISTORY */}
          {activeTab === "ORDERS" && (
            <div className="bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
              <div className="px-4 py-3 border-b border-[#E4E0DB] bg-[#F7F7F5] flex items-center justify-between">
                <span className="text-xs font-medium text-[#111111]">Order History</span>
                <span className="text-xs text-[#6B6667]">
                  {customer.orders.length} total orders
                </span>
              </div>

              {customer.orders.length === 0 ? (
                <div className="p-8 text-center text-[#6B6667]">
                  <p className="text-xs font-medium">No order history recorded for this customer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                        <th className="px-4 py-0 font-medium">Order ID</th>
                        <th className="px-4 py-0 font-medium">Date</th>
                        <th className="px-4 py-0 font-medium">Vendor</th>
                        <th className="px-4 py-0 font-medium text-right">Amount</th>
                        <th className="px-4 py-0 font-medium text-center">Status</th>
                        <th className="px-4 sm:px-5 py-0 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0DB] text-[13px] text-[#111111]">
                      {customer.orders.map((order) => (
                        <tr key={order.id} className="h-11 hover:bg-[#F7F7F5]/50 transition-colors">
                          <td className="px-4 py-0 font-mono text-xs font-medium text-[#111111] whitespace-nowrap">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="hover:text-[#FF5A1F]"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-0 text-xs text-[#6B6667] whitespace-nowrap">
                            {order.createdAt}
                          </td>
                          <td className="px-4 py-0 font-medium text-[#111111]">{order.vendorName}</td>
                          <td className="px-4 py-0 font-semibold text-right text-[#111111] tabular-nums whitespace-nowrap">
                            ₹{order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-0 text-center whitespace-nowrap">
                            <StatusBadge status={order.status} variant="order" />
                          </td>
                          <td className="px-4 sm:px-5 py-0 text-right whitespace-nowrap">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] hover:bg-[#FFF0E8] px-2 py-0.5 rounded transition-colors inline-flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === "ADDRESSES" && (
            <div className="space-y-3">
              {customer.addresses.length === 0 ? (
                <div className="p-8 bg-white rounded-[10px] border border-[#E4E0DB] text-center text-[#6B6667]">
                  <p className="text-xs font-medium">No saved addresses on file.</p>
                </div>
              ) : (
                customer.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#111111]">
                        {address.recipientName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F4F1EA] text-[#6B6667]">
                        {address.type}
                      </span>
                      {address.isDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                          Default Address
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#111111]">
                      {address.street}
                      {address.locality ? `, ${address.locality}` : ""}, {address.city},{" "}
                      {address.state} - {address.pincode}
                    </p>
                    <p className="text-xs font-mono text-[#6B6667]">Phone: {address.phone}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === "REVIEWS" && (
            <div className="space-y-3">
              {customer.reviews.length === 0 ? (
                <div className="p-8 bg-white rounded-[10px] border border-[#E4E0DB] text-center text-[#6B6667]">
                  <p className="text-xs font-medium">No reviews submitted by this customer.</p>
                </div>
              ) : (
                customer.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#111111]">
                          {rev.productTitle}
                        </span>
                        <span className="text-xs text-[#6B6667]">({rev.vendorName})</span>
                        {rev.verifiedPurchase && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#ECFDF5] text-[#20885A]">
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#6B6667]">{rev.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[#C9822E]">
                      <span className="font-mono text-xs font-semibold">{rev.rating.toFixed(1)}</span>
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    </div>

                    <p className="text-xs text-[#111111] italic">&quot;{rev.comment}&quot;</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: SUPPORT TICKETS */}
          {activeTab === "TICKETS" && (
            <div className="space-y-3">
              {customer.tickets.length === 0 ? (
                <div className="p-8 bg-white rounded-[10px] border border-[#E4E0DB] text-center text-[#6B6667]">
                  <p className="text-xs font-medium">No support tickets associated with this account.</p>
                </div>
              ) : (
                customer.tickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-[#111111]">
                          {t.ticketNumber}
                        </span>
                        <span className="text-xs font-medium text-[#111111]">{t.subject}</span>
                      </div>
                      <p className="text-xs text-[#6B6667] mt-0.5">
                        Assigned: {t.assignedAgent}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F4F1EA] text-[#6B6667]">
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Side Column: Profile Details & Contact (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-5 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FFF0E8] text-[#D94B17] font-semibold text-sm flex items-center justify-center shrink-0 border border-[#FF5A1F]/20">
                {getInitials(customer.name)}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111111]">{customer.name}</h2>
                <p className="text-xs text-[#6B6667]">Marketplace Customer</p>
                <span className="inline-block mt-1 font-mono text-[11px] bg-[#F4F1EA] px-1.5 py-0.5 rounded text-[#6B6667]">
                  {customer.customerNumber}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E4E0DB] pt-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B6667]">Phone</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-medium text-[#111111] tabular-nums">
                    {customer.phone}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(customer.phone, "phone")}
                    className="p-1 rounded text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA]"
                    title="Copy phone number"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedField === "phone" ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B6667]">Email</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#111111] font-medium truncate max-w-[170px]" title={customer.email}>
                    {customer.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(customer.email, "email")}
                    className="p-1 rounded text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA]"
                    title="Copy email address"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedField === "email" ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B6667]">Registration Date</span>
                <span className="text-[#111111] font-medium">{customer.registrationDate}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B6667]">Account Status</span>
                <StatusBadge status={customer.status} variant="user" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Suspend/Reactivate */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[12px] border border-[#E4E0DB] max-w-md w-full p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[#111111]">
                {customer.status === "ACTIVE"
                  ? `Suspend Customer ${customer.customerNumber}?`
                  : `Reactivate Customer ${customer.customerNumber}?`}
              </h3>
              <p className="text-xs text-[#6B6667] mt-1.5 leading-relaxed">
                {customer.status === "ACTIVE"
                  ? `Suspending ${customer.name} will restrict their ability to place new marketplace orders.`
                  : `Reactivating ${customer.name} will restore regular marketplace checkout access.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E0DB]">
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(false)}
                className="px-3.5 py-2 rounded-[8px] border border-[#E4E0DB] text-[#6B6667] hover:text-[#111111] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={cn(
                  "px-4 py-2 rounded-[8px] text-xs font-medium text-white transition-colors",
                  customer.status === "ACTIVE"
                    ? "bg-[#DA1E28] hover:bg-[#B91C1C]"
                    : "bg-[#20885A] hover:bg-[#15803D]"
                )}
              >
                {customer.status === "ACTIVE" ? "Confirm Suspension" : "Confirm Reactivation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
