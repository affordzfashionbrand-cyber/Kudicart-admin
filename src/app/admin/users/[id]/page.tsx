"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_CUSTOMERS } from "@/mocks/users";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = (params?.id as string) || "cus_88219";

  // Find customer or default to first
  const customer =
    MOCK_CUSTOMERS.find((c) => c.id === customerId) || MOCK_CUSTOMERS[0];

  const [activeTab, setActiveTab] = useState<"ORDERS" | "ADDRESSES" | "REVIEWS" | "TICKETS">("ORDERS");
  const [accountStatus, setAccountStatus] = useState(customer.status);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleSuspend = () => {
    const newStatus = accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setAccountStatus(newStatus);
    setIsSuspendModalOpen(false);
    setToastMessage(
      `Account ${customer.customerNumber} has been updated to ${newStatus}. (Local development state)`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-space-md max-w-[1440px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-[#333333] animate-fadeIn">
          <span className="material-symbols-outlined text-[#20885A] text-xl">info</span>
          <span className="font-label-sm text-label-sm">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-secondary hover:text-white ml-2"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Back Link */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-secondary hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Back to Users
        </Link>
      </div>

      {/* Header Action Card */}
      <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {customer.name}
            </h1>
            <span className="font-code-sm text-code-sm bg-surface-container-low px-2 py-0.5 rounded border border-surface-container-highest text-secondary font-medium">
              {customer.customerNumber}
            </span>
            <StatusBadge status={accountStatus} variant="user" />
            <span className="px-2 py-0.5 rounded text-label-xs font-label-xs bg-surface-container text-secondary font-medium">
              Tier: {customer.tier}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-secondary">
            Registered {customer.registrationDate} • Marketplace Direct Customer • {customer.kycLevel}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => alert(`Exporting dossier for ${customer.name}...`)}
            className="px-3.5 py-2 rounded-lg border border-surface-container-highest bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">more_horiz</span>
            More Actions
          </button>

          <button
            onClick={() => setIsSuspendModalOpen(true)}
            className={`px-3.5 py-2 rounded-lg border font-label-sm text-label-sm font-semibold flex items-center gap-1.5 transition-colors ${
              accountStatus === "ACTIVE"
                ? "border-red-200 bg-[#FEF2F2] hover:bg-[#DA1E28] hover:text-white text-[#DA1E28]"
                : "border-emerald-200 bg-[#ECFDF5] hover:bg-[#20885A] hover:text-white text-[#20885A]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {accountStatus === "ACTIVE" ? "block" : "check_circle"}
            </span>
            {accountStatus === "ACTIVE" ? "Suspend Account" : "Reactivate Account"}
          </button>
        </div>
      </div>

      {/* 2-Column Operational Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left / Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-space-md">
          {/* Operational Summary Row / Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Metric 1: Total Spent */}
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-xs text-label-xs uppercase tracking-wider">Total Spent</span>
                <span className="material-symbols-outlined text-[18px] text-primary">account_balance_wallet</span>
              </div>
              <div className="mt-2">
                <span className="font-headline-md text-headline-md font-bold text-on-surface font-code-sm">
                  ₹{customer.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <p className="font-label-xs text-label-xs text-secondary mt-0.5">Lifetime order spend</p>
              </div>
            </div>

            {/* Metric 2: Total Orders */}
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-xs text-label-xs uppercase tracking-wider">Total Orders</span>
                <span className="material-symbols-outlined text-[18px] text-[#20885A]">shopping_bag</span>
              </div>
              <div className="mt-2">
                <span className="font-headline-md text-headline-md font-bold text-on-surface font-code-sm">
                  {customer.totalOrders} Orders
                </span>
                <p className="font-label-xs text-label-xs text-secondary mt-0.5">
                  {customer.totalOrders > 0 ? `${customer.totalOrders - 1} Delivered, 1 In-Transit` : "No orders"}
                </p>
              </div>
            </div>

            {/* Metric 3: Average Order Value */}
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-xs text-label-xs uppercase tracking-wider">Avg Order Value</span>
                <span className="material-symbols-outlined text-[18px] text-tertiary">query_stats</span>
              </div>
              <div className="mt-2">
                <span className="font-headline-md text-headline-md font-bold text-on-surface font-code-sm">
                  ₹{customer.avgOrderValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <p className="font-label-xs text-label-xs text-[#20885A] mt-0.5 font-semibold">
                  ↑ 12% above platform avg
                </p>
              </div>
            </div>

            {/* Metric 4: Saved Addresses */}
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-xs text-label-xs uppercase tracking-wider">Saved Addresses</span>
                <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span>
              </div>
              <div className="mt-2">
                <span className="font-headline-md text-headline-md font-bold text-on-surface font-code-sm">
                  {customer.addresses.length} Locations
                </span>
                <p className="font-label-xs text-label-xs text-secondary mt-0.5">Home (Default), Office</p>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-1 flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("ORDERS")}
                className={`px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors flex items-center gap-2 ${
                  activeTab === "ORDERS"
                    ? "bg-surface text-on-surface font-bold border border-surface-container-highest shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    activeTab === "ORDERS" ? "text-primary" : "text-secondary"
                  }`}
                >
                  shopping_cart
                </span>
                <span>Order History ({customer.orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("ADDRESSES")}
                className={`px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors flex items-center gap-1.5 ${
                  activeTab === "ADDRESSES"
                    ? "bg-surface text-on-surface font-bold border border-surface-container-highest shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">home_pin</span>
                <span>Saved Addresses ({customer.addresses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("REVIEWS")}
                className={`px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors flex items-center gap-1.5 ${
                  activeTab === "REVIEWS"
                    ? "bg-surface text-on-surface font-bold border border-surface-container-highest shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span>Reviews ({customer.reviews.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("TICKETS")}
                className={`px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors flex items-center gap-1.5 ${
                  activeTab === "TICKETS"
                    ? "bg-surface text-on-surface font-bold border border-surface-container-highest shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                <span>Support Tickets ({customer.tickets.length})</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 pr-2">
              <button
                onClick={() => alert("Downloading customer CSV log...")}
                className="p-1 rounded text-secondary hover:text-on-surface hover:bg-surface-container"
                title="Download CSV"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Order History */}
          {activeTab === "ORDERS" && (
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl overflow-hidden shadow-none">
              <div className="px-space-md py-3 border-b border-surface-container-highest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-secondary">receipt_long</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Customer Orders</h2>
                  <span className="font-code-xs text-code-xs px-2 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                    {customer.orders.length} recorded
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="h-10 bg-surface-container-low border-b border-surface-container-highest text-secondary font-label-xs text-label-xs uppercase tracking-wider">
                      <th className="px-4 py-2 font-semibold">Order ID</th>
                      <th className="px-4 py-2 font-semibold">Date &amp; Time</th>
                      <th className="px-4 py-2 font-semibold">Boutique Vendor</th>
                      <th className="px-4 py-2 font-semibold">Items</th>
                      <th className="px-4 py-2 font-semibold text-right">Amount</th>
                      <th className="px-4 py-2 font-semibold">Payment</th>
                      <th className="px-4 py-2 font-semibold">Status</th>
                      <th className="px-4 py-2 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-highest text-body-sm font-body-sm">
                    {customer.orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-secondary">
                          No order history for this customer
                        </td>
                      </tr>
                    ) : (
                      customer.orders.map((order) => (
                        <tr key={order.id} className="h-12 hover:bg-surface transition-colors">
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                              {order.orderNumber}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-secondary font-code-xs">
                            {order.createdAt}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className="font-body-sm-medium text-body-sm-medium text-on-surface">
                              {order.vendorName}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-secondary">
                            {order.itemCount} items
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap font-code-sm text-code-sm font-semibold text-right tabular-nums text-on-surface">
                            ₹{order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <StatusBadge status={order.paymentStatus} variant="payment" />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <StatusBadge status={order.status} variant="order" />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-primary hover:text-pressed-orange font-label-xs text-label-xs font-semibold"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Saved Addresses */}
          {activeTab === "ADDRESSES" && (
            <div className="space-y-3">
              {customer.addresses.length === 0 ? (
                <div className="p-8 bg-surface-container-lowest rounded-xl border border-surface-container-highest text-center text-secondary">
                  No saved addresses recorded
                </div>
              ) : (
                customer.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          {address.recipientName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-secondary">
                          {address.type}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                            Default Delivery Address
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-on-surface">
                        {address.street}, {address.locality}, {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-code-xs text-secondary font-medium">Contact: {address.phone}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === "REVIEWS" && (
            <div className="space-y-3">
              {customer.reviews.length === 0 ? (
                <div className="p-8 bg-surface-container-lowest rounded-xl border border-surface-container-highest text-center text-secondary">
                  No reviews submitted yet
                </div>
              ) : (
                customer.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-body-sm-medium text-body-sm-medium text-on-surface font-semibold">
                          {rev.productTitle}
                        </span>
                        <span className="font-code-xs text-code-xs text-secondary">from {rev.vendorName}</span>
                        {rev.verifiedPurchase && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="font-code-xs text-code-xs text-secondary">{rev.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-[16px] text-amber-500 material-symbols-fill"
                        >
                          star
                        </span>
                      ))}
                      <span className="font-code-xs text-code-xs text-secondary ml-1 font-bold">
                        {rev.rating.toFixed(1)} / 5.0
                      </span>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface italic">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Support Tickets */}
          {activeTab === "TICKETS" && (
            <div className="space-y-3">
              {customer.tickets.length === 0 ? (
                <div className="p-8 bg-surface-container-lowest rounded-xl border border-surface-container-highest text-center text-secondary">
                  No support inquiries on record
                </div>
              ) : (
                customer.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                            {ticket.ticketNumber}
                          </span>
                          <span className="font-body-sm-medium text-body-sm-medium text-on-surface">
                            {ticket.subject}
                          </span>
                        </div>
                        <p className="font-label-xs text-label-xs text-secondary mt-0.5">
                          Assigned to: {ticket.assignedAgent} • SLA response: {ticket.slaResponseTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-xs font-label-xs bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-space-md">
          {/* Customer Profile & Contact Card */}
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-[#FFF0E8] text-primary flex items-center justify-center font-headline-md text-headline-md font-bold shrink-0 border border-[#FFDBCE]">
                {getInitials(customer.name)}
              </div>
              <div className="space-y-0.5">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {customer.name}
                </h3>
                <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider font-semibold">
                  End Customer Profile
                </p>
                <span className="inline-flex items-center gap-1 text-label-xs font-label-xs text-[#20885A] font-medium">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  {customer.kycLevel}
                </span>
              </div>
            </div>

            <div className="border-t border-surface-container-highest pt-3 space-y-3">
              {/* Phone */}
              <div className="flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span>Phone Number</span>
                </div>
                <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                  {customer.phone}
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  <span>Email Address</span>
                </div>
                <span className="text-on-surface truncate max-w-[180px] text-right font-medium">
                  {customer.email}
                </span>
              </div>

              {/* Languages */}
              <div className="flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">translate</span>
                  <span>Languages</span>
                </div>
                <span className="text-on-surface font-medium">English, Hindi</span>
              </div>

              {/* Communication Preferences */}
              <div className="pt-2 border-t border-surface-container-highest">
                <span className="font-label-xs text-label-xs text-secondary uppercase tracking-wider block mb-2 font-semibold">
                  Communication Channels
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-label-xs bg-[#ECFDF5] text-[#20885A] font-medium">
                    WhatsApp Active
                  </span>
                  <span className="px-2 py-0.5 rounded text-label-xs bg-[#ECFDF5] text-[#20885A] font-medium">
                    SMS Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security & Metadata Card */}
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-space-md space-y-3">
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Account Security &amp; Activity
            </h4>
            <div className="space-y-2 text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-secondary">Account Created</span>
                <span className="font-code-xs text-secondary font-medium">{customer.registrationDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Last Login</span>
                <span className="font-code-xs text-secondary font-medium">Today, 14:12 IST</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Device Platform</span>
                <span className="font-medium text-on-surface">Apple iOS v2.4.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Suspension Confirmation Dialog */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-surface-container-highest max-w-md w-full p-space-lg shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  accountStatus === "ACTIVE"
                    ? "bg-[#FEF2F2] text-[#DA1E28]"
                    : "bg-[#ECFDF5] text-[#20885A]"
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {accountStatus === "ACTIVE" ? "warning" : "check_circle"}
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {accountStatus === "ACTIVE"
                    ? `Suspend Customer ${customer.customerNumber}?`
                    : `Reactivate Customer ${customer.customerNumber}?`}
                </h3>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  {accountStatus === "ACTIVE"
                    ? `Suspending ${customer.name} will restrict their ability to place new marketplace orders and use Try & Buy doorstep services.`
                    : `Reactivating ${customer.name} will restore regular marketplace checkout access.`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-highest">
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-surface-container-highest text-secondary hover:text-on-surface font-label-sm text-label-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleSuspend}
                className={`px-4 py-2 rounded-lg font-label-sm text-label-sm font-semibold text-white transition-colors ${
                  accountStatus === "ACTIVE"
                    ? "bg-[#DA1E28] hover:bg-[#B91C1C]"
                    : "bg-[#20885A] hover:bg-[#15803D]"
                }`}
              >
                {accountStatus === "ACTIVE" ? "Confirm Suspension" : "Confirm Reactivation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
