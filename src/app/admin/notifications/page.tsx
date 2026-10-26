"use client";

import React, { useState, useMemo } from "react";
import {
  OperationalNotification,
  NotificationCategory,
  NotificationTargetRole,
  NotificationDeliveryStatus,
} from "@/types/notifications";
import { MOCK_NOTIFICATIONS } from "@/mocks/notifications";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<OperationalNotification[]>(
    MOCK_NOTIFICATIONS
  );
  const [selectedNotification, setSelectedNotification] =
    useState<OperationalNotification | null>(MOCK_NOTIFICATIONS[0]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [broadcastTitle, setBroadcastTitle] = useState<string>("");
  const [broadcastScope, setBroadcastScope] = useState<string>("Bandra West Node");
  const [broadcastSeverity, setBroadcastSeverity] =
    useState<string>("Operational Warning");
  const [broadcastNote, setBroadcastNote] = useState<string>("");
  const [broadcastModalOpen, setBroadcastModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Filter logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesRecipient =
          n.recipientName.toLowerCase().includes(q) ||
          n.recipientId.toLowerCase().includes(q);
        const matchesMessage = n.messagePreview.toLowerCase().includes(q);
        if (!matchesTitle && !matchesRecipient && !matchesMessage) return false;
      }

      if (categoryFilter !== "ALL" && n.category !== categoryFilter) {
        return false;
      }

      if (roleFilter !== "ALL" && n.targetRole !== roleFilter) {
        return false;
      }

      if (statusFilter !== "ALL" && n.deliveryStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [notifications, searchTerm, categoryFilter, roleFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification({ ...selectedNotification, read: true });
    }
    setToastMessage("Notification marked as read.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              Notifications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF0E8] text-[#D94B17] border border-[#FF5A1F]/20">
              {notifications.length} Recorded ({unreadCount} Unread)
            </span>
          </div>
          <p className="text-sm text-[#6B6667] mt-1">
            Review operational alerts, system dispatch messages, and broadcast announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setToastMessage("Notification queue refreshed.");
              setTimeout(() => setToastMessage(null), 2500);
            }}
            className="h-9 px-3.5 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] rounded-lg text-xs font-semibold text-[#111111] flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* System-Alert Broadcast Banner */}
      <section className="bg-white border border-[#E4E0DB] rounded-xl p-5 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5A1F] via-[#D94B17] to-[#E4E0DB]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#FFF0E8] text-[#FF5A1F] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">campaign</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111111]">
                  System-Alert Broadcast Banner
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Provisional Admin Capability
                </span>
              </div>
              <p className="text-xs text-[#6B6667]">
                Broadcast high-priority notices to dark-store hub operators and delivery fleet dispatchers.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-[#6B6667] font-mono">
            Ref: <strong className="text-[#111111]">OPS-ALERT-DRAFT-v2.4</strong>
          </span>
        </div>

        {/* Form controls */}
        <form onSubmit={handleBroadcastSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[#E4E0DB]">
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-[11px] text-[#6B6667] font-semibold uppercase tracking-wider">
                Alert Title
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Bandra Terminal Grid Congestion Notice"
                className="h-[38px] px-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg focus:outline-none focus:border-[#FF5A1F] focus:bg-white text-[#111111]"
              />
            </div>
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="text-[11px] text-[#6B6667] font-semibold uppercase tracking-wider">
                Target Scope
              </label>
              <select
                value={broadcastScope}
                onChange={(e) => setBroadcastScope(e.target.value)}
                className="h-[38px] px-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg focus:outline-none focus:border-[#FF5A1F] text-[#111111] cursor-pointer"
              >
                <option value="All Hubs & Fleets">All Hubs & Fleets</option>
                <option value="Bandra West Node">Bandra West Node</option>
                <option value="Fleet Only (Drivers)">Fleet Only (Drivers)</option>
                <option value="Boutique Merchants">Boutique Merchants</option>
              </select>
            </div>
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-[11px] text-[#6B6667] font-semibold uppercase tracking-wider">
                Severity
              </label>
              <select
                value={broadcastSeverity}
                onChange={(e) => setBroadcastSeverity(e.target.value)}
                className="h-[38px] px-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg focus:outline-none focus:border-[#FF5A1F] text-[#111111] cursor-pointer"
              >
                <option value="Informational">Informational</option>
                <option value="Operational Warning">Operational Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="text-[11px] text-[#6B6667] font-semibold uppercase tracking-wider">
                Dispatch Note
              </label>
              <input
                type="text"
                value={broadcastNote}
                onChange={(e) => setBroadcastNote(e.target.value)}
                placeholder="Brief message content payload..."
                className="h-[38px] px-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg focus:outline-none focus:border-[#FF5A1F] focus:bg-white text-[#111111]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E4E0DB]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B6667]">
              <span className="material-symbols-outlined text-[15px] text-amber-600">
                info
              </span>
              <span>
                Broadcast API queue endpoint currently throttled to sandbox staging. Dispatches require verified backend message broker.
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  if (!broadcastTitle) {
                    setToastMessage("Please enter an alert title first.");
                    setTimeout(() => setToastMessage(null), 3000);
                    return;
                  }
                  setToastMessage(
                    `Preview: [${broadcastSeverity.toUpperCase()}] ${broadcastTitle}`
                  );
                  setTimeout(() => setToastMessage(null), 4000);
                }}
                className="h-9 px-3 rounded-lg border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-[#111111] font-semibold text-xs transition-colors"
              >
                Preview Alert
              </button>
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-[#FF5A1F] hover:bg-[#D94B17] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Broadcast Notice</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Filter Toolbar */}
      <section className="bg-white border border-[#E4E0DB] rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Keyword search */}
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B6667] text-[16px]">
              filter_list
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter title, recipient, ref..."
              className="w-full h-[36px] pl-8 pr-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg focus:outline-none focus:border-[#FF5A1F] focus:bg-white text-[#111111] placeholder:text-[#6B6667]"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-xs bg-white border border-[#E4E0DB] rounded-lg text-[#111111] focus:outline-none focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="KYC">KYC</option>
              <option value="Assignment">Assignment</option>
              <option value="Order Updates">Order Updates</option>
              <option value="System Alerts">System Alerts</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Target Role filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-xs bg-white border border-[#E4E0DB] rounded-lg text-[#111111] focus:outline-none focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="Driver">Driver</option>
              <option value="Customer">Customer</option>
              <option value="Vendor">Vendor</option>
              <option value="Central Admin">Central Admin</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Delivery Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-xs bg-white border border-[#E4E0DB] rounded-lg text-[#111111] focus:outline-none focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Delivery Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Queued">Queued / Pending</option>
              <option value="Failed">Failed / Retrying</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="h-[36px] px-3 text-xs text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] rounded-lg flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          <span>Clear Filters</span>
        </button>
      </section>

      {/* Main 2-Column Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Notification Table (7 cols / 60%) */}
        <div className="lg:col-span-7 bg-white border border-[#E4E0DB] rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-[#E4E0DB] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#111111]">
                Operational Notification Log
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#F4F1EA] text-[#6B6667]">
                {filteredNotifications.length} of {notifications.length} shown
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#6B6667]">
              <span className="material-symbols-outlined text-[#20885A] text-[16px]">
                check_circle
              </span>
              <span>Dispatches healthy</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-[11px] text-[#6B6667] uppercase tracking-wider font-semibold">
                  <th className="py-2 px-3 pl-4">Timestamp</th>
                  <th className="py-2 px-2">Category</th>
                  <th className="py-2 px-2">Target</th>
                  <th className="py-2 px-3">Recipient</th>
                  <th className="py-2 px-3">Title & Preview</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-3 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0DB] text-xs">
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <EmptyState
                        title="No notifications found"
                        description="Try resetting your keyword search or active filters."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((n) => {
                    const isSelected = selectedNotification?.id === n.id;
                    return (
                      <tr
                        key={n.id}
                        onClick={() => setSelectedNotification(n)}
                        className={`h-12 transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#FFF8F5] border-l-4 border-l-[#FF5A1F]"
                            : "hover:bg-[#F7F7F5]"
                        } ${!n.read ? "font-semibold" : ""}`}
                      >
                        <td className="py-2.5 px-3 pl-4 font-mono text-[11px] text-[#111111] whitespace-nowrap">
                          {n.timestamp}{" "}
                          <span className="text-[#6B6667] text-[10px]">IST</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <StatusBadge status={n.category} variant="notification" />
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="text-[11px] text-[#6B6667] font-medium">
                            {n.targetRole}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-[#111111]">
                            {n.recipientName}
                          </div>
                          <div className="font-mono text-[10px] text-[#6B6667]">
                            {n.recipientId}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 max-w-[190px]">
                          <div className="text-xs text-[#111111] truncate">
                            {n.title}
                          </div>
                          <div className="text-[#6B6667] text-[11px] truncate font-normal">
                            {n.messagePreview}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <StatusBadge
                            status={n.deliveryStatus}
                            variant="notification"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right pr-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNotification(n);
                            }}
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              isSelected
                                ? "bg-[#FF5A1F] text-white"
                                : "text-[#6B6667] hover:text-[#111111] border border-[#E4E0DB] hover:bg-[#F7F7F5]"
                            }`}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Notification Detail Dossier (5 cols / 40%) */}
        <div className="lg:col-span-5 bg-white border border-[#E4E0DB] rounded-xl p-5 space-y-5 shadow-2xs">
          {selectedNotification ? (
            <>
              {/* Dossier Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#111111]">
                      Dispatch Dossier
                    </h3>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F4F1EA] text-[#6B6667]">
                      {selectedNotification.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6667] mt-0.5">
                    Live channel delivery verification record
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                    {selectedNotification.deliveryChannel}
                  </span>
                </div>
              </div>

              {/* Message Details */}
              <div className="p-3.5 rounded-lg bg-[#FFF8F5] border border-[#FFDBD0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#AE3200]">
                    {selectedNotification.title}
                  </span>
                  <StatusBadge
                    status={selectedNotification.category}
                    variant="notification"
                  />
                </div>
                <p className="text-xs text-[#111111] leading-relaxed">
                  {selectedNotification.messageFull}
                </p>
              </div>

              {/* Recipient Details */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] uppercase tracking-wider text-[#6B6667] font-semibold">
                  Recipient Identity
                </h4>
                <div className="p-3 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6667]">Name:</span>
                    <span className="font-semibold text-[#111111]">
                      {selectedNotification.recipientName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6667]">Identifier:</span>
                    <span className="font-mono text-[11px] text-[#FF5A1F] font-semibold">
                      {selectedNotification.recipientId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6667]">Target Role:</span>
                    <span className="text-[#111111]">
                      {selectedNotification.targetRole}
                    </span>
                  </div>
                  {selectedNotification.dispatchedHub && (
                    <div className="flex justify-between items-center pt-1 border-t border-[#E4E0DB]">
                      <span className="text-[#6B6667]">Origin Hub:</span>
                      <span className="text-[#111111]">
                        {selectedNotification.dispatchedHub}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Metadata */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] uppercase tracking-wider text-[#6B6667] font-semibold">
                  Delivery Details
                </h4>
                <div className="p-3 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6667]">Timestamp:</span>
                    <span className="font-mono text-[11px] text-[#111111]">
                      {selectedNotification.timestampFull}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6667]">Gateway Status:</span>
                    <StatusBadge
                      status={selectedNotification.deliveryStatus}
                      variant="notification"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6667]">Read Status:</span>
                    <span
                      className={`font-semibold ${
                        selectedNotification.read
                          ? "text-[#20885A]"
                          : "text-[#D94B17]"
                      }`}
                    >
                      {selectedNotification.read ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                {!selectedNotification.read && (
                  <button
                    onClick={() => handleMarkAsRead(selectedNotification.id)}
                    className="w-full h-9 bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-[#111111] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#20885A]">
                      done_all
                    </span>
                    <span>Mark as Read</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-[#6B6667]">
              Select a notification to view dispatch dossier
            </div>
          )}
        </div>
      </section>

      {/* Broadcast Modal Notice */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFF0E8] text-[#FF5A1F] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">campaign</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Broadcast Dispatch Notice
                </h3>
                <p className="text-xs text-[#6B6667]">
                  Backend API contract dependency
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-xs text-[#B45309] space-y-2">
              <p className="font-semibold">
                Broadcast endpoint is not connected to production message gateways.
              </p>
              <p className="text-[11px] leading-relaxed">
                The administrative broadcast dispatch API (<code>POST /api/v1/admin/notifications/broadcast</code>) is currently an unbacked staging feature. To prevent unauthorized mass broadcasts, real device dispatch requires live push gateway integration.
              </p>
            </div>

            <div className="text-xs text-[#111111] space-y-1">
              <div>
                <strong>Title:</strong> {broadcastTitle || "N/A"}
              </div>
              <div>
                <strong>Target:</strong> {broadcastScope}
              </div>
              <div>
                <strong>Severity:</strong> {broadcastSeverity}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#333333]"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
