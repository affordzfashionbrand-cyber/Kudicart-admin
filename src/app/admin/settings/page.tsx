"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  User,
  Mail,
  Fingerprint,
  Building2,
  SlidersHorizontal,
  Volume2,
  RefreshCw,
  LogOut,
  Key,
  CheckCircle2,
  X,
  ChevronDown,
  Info,
  History,
  Layers,
  AlertCircle,
} from "lucide-react";
import {
  AdminAccountProfile,
  WorkspacePreferences,
  ActiveSessionDetails,
} from "@/types/settings";
import {
  MOCK_ADMIN_PROFILE,
  DEFAULT_WORKSPACE_PREFERENCES,
  MOCK_ACTIVE_SESSION,
} from "@/mocks/settings";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const [profile] = useState<AdminAccountProfile>(MOCK_ADMIN_PROFILE);
  const [preferences, setPreferences] = useState<WorkspacePreferences>(
    DEFAULT_WORKSPACE_PREFERENCES
  );
  const [sessionInfo] = useState<ActiveSessionDetails>(MOCK_ACTIVE_SESSION);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);

  // Load preferences from backend API or localStorage fallback
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kudicart_workspace_prefs");
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch {
      // Ignore local storage error
    }

    api.settings.getPreferences()
      .then((prefs) => {
        if (prefs) setPreferences(prefs);
      })
      .catch(() => {});
  }, []);

  const savePreferences = async (newPrefs: WorkspacePreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem("kudicart_workspace_prefs", JSON.stringify(newPrefs));
    } catch {
      // Ignore local storage error
    }

    try {
      await api.settings.savePreferences(newPrefs);
      setFeedback("Workspace preferences synchronized with server.");
    } catch {
      setFeedback("Workspace preferences updated locally.");
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleResetCache = () => {
    try {
      localStorage.removeItem("kudicart_workspace_prefs");
      setPreferences(DEFAULT_WORKSPACE_PREFERENCES);
      setFeedback("Local client cache and presentation preferences reset.");
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback("Failed to reset local cache.");
    }
  };

  const handleSignOut = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Page Title & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E0DB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#0043CE] text-xs font-medium">
              Administrative Configuration
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-1">
            Manage account profile, operational workspace preferences, and session controls.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-[8px] bg-[#F4F1EA] border border-[#E4E0DB] text-xs text-[#6B6667]">
          <Lock className="w-3.5 h-3.5 text-[#20885A]" />
          <span>
            Access Role:{" "}
            <strong className="text-[#111111] font-semibold">
              {profile.accessLevel}
            </strong>
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[8px] flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Vertical Grouped Stack */}
      <div className="space-y-6">
        {/* ================= SECTION A: Authenticated Account & Session Identity ================= */}
        <section className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-[#E4E0DB] flex items-center justify-between bg-[#F9F9F7]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[6px] bg-[#F4F1EA] flex items-center justify-center text-[#111111]">
                <User className="w-4 h-4 text-[#6B6667]" />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-[#111111]">
                  Account Profile
                </h2>
                <p className="text-[11px] text-[#6B6667]">
                  Administrative personnel record within Central Operations
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F1EA] border border-[#E4E0DB] text-[11px] font-mono text-[#6B6667]">
              ADMIN-AUTH
            </span>
          </div>

          <div className="p-6">
            {/* Account Badge Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1A1C1B] text-white flex items-center justify-center text-base font-semibold border-2 border-white shadow-xs">
                  AO
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-semibold text-[#111111]">
                      {profile.displayName}
                    </span>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#20885A] text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-[#6B6667] mt-0.5">
                    {profile.role} • Central Operations
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6667]">Permissions:</span>
                <span className="px-2.5 py-1 rounded-[6px] bg-white border border-[#E4E0DB] text-xs font-mono text-[#111111] font-medium">
                  {profile.assignedPermissions}
                </span>
              </div>
            </div>

            {/* Read-Only Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Display Name */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1.5 uppercase tracking-wider">
                  DISPLAY NAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.displayName}
                    readOnly
                    className="w-full h-[38px] px-3 pr-10 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] cursor-not-allowed select-all focus:outline-none"
                  />
                  <Lock className="w-4 h-4 absolute right-3 top-2.5 text-[#6B6667]" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1.5 uppercase tracking-wider">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full h-[38px] px-3 pr-24 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs font-mono text-[#111111] cursor-not-allowed select-all focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2 px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#20885A] text-[10px] font-medium border border-[#A7F3D0]">
                    Verified
                  </span>
                </div>
              </div>

              {/* Staff Identifier */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1.5 uppercase tracking-wider">
                  STAFF IDENTIFIER
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.staffId}
                    readOnly
                    className="w-full h-[38px] px-3 pr-10 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs font-mono text-[#111111] font-medium cursor-not-allowed select-all focus:outline-none"
                  />
                  <Fingerprint className="w-4 h-4 absolute right-3 top-2.5 text-[#6B6667]" />
                </div>
              </div>

              {/* Operating Terminal */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1.5 uppercase tracking-wider">
                  ASSIGNED OPERATING TERMINAL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.assignedTerminal}
                    readOnly
                    className="w-full h-[38px] px-3 pr-10 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] cursor-not-allowed select-all focus:outline-none"
                  />
                  <Building2 className="w-4 h-4 absolute right-3 top-2.5 text-[#6B6667]" />
                </div>
              </div>
            </div>

            {/* Footnote */}
            <div className="mt-5 p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2.5 text-xs text-[#6B6667]">
              <Info className="w-4 h-4 text-[#6B6667] shrink-0 mt-0.5" />
              <span>
                Administrative account credentials and role assignments are managed centrally and cannot be modified locally. Contact workspace operations for credential delegation or clearance updates.
              </span>
            </div>
          </div>
        </section>

        {/* ================= SECTION B: Operational Workspace & Table Preferences ================= */}
        <section className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-[#E4E0DB] flex items-center justify-between bg-[#F9F9F7]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[6px] bg-[#F4F1EA] flex items-center justify-center text-[#111111]">
                <SlidersHorizontal className="w-4 h-4 text-[#6B6667]" />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-[#111111]">
                  Workspace & Table Preferences
                </h2>
                <p className="text-[11px] text-[#6B6667]">
                  Local client presentation standards, data density, and table row sizing
                </p>
              </div>
            </div>
            <button
              onClick={handleResetCache}
              className="px-3 py-1.5 rounded-[8px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors"
            >
              Reset Local Cache
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Standard Selectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Default Table Page Size */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1.5 uppercase tracking-wider">
                  DEFAULT TABLE PAGE SIZE
                </label>
                <div className="relative">
                  <select
                    value={preferences.defaultPageSize}
                    onChange={(e) =>
                      savePreferences({
                        ...preferences,
                        defaultPageSize: Number(e.target.value),
                      })
                    }
                    className="w-full h-[38px] px-3 pr-8 rounded-[8px] bg-white border border-[#E4E0DB] text-xs text-[#111111] focus:border-[#FF5A1F] cursor-pointer appearance-none"
                  >
                    <option value={10}>10 rows per page</option>
                    <option value={25}>25 rows per page</option>
                    <option value={50}>50 rows per page</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none" />
                </div>
                <p className="text-[11px] text-[#6B6667] mt-1">
                  Default pagination chunk for operational tables.
                </p>
              </div>

              {/* Currency Display Standard */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1.5 uppercase tracking-wider">
                  CURRENCY DISPLAY STANDARD
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={preferences.currencyStandard}
                    readOnly
                    className="w-full h-[38px] px-3 pr-8 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] cursor-not-allowed select-all focus:outline-none"
                  />
                  <Lock className="w-4 h-4 absolute right-2.5 top-2.5 text-[#6B6667]" />
                </div>
                <p className="text-[11px] text-[#6B6667] mt-1">
                  Marketplace currency fixed to INR (₹).
                </p>
              </div>

              {/* Timestamp Display Format */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1.5 uppercase tracking-wider">
                  TIMESTAMP DISPLAY FORMAT
                </label>
                <div className="relative">
                  <select
                    value={preferences.timestampFormat}
                    onChange={(e) =>
                      savePreferences({
                        ...preferences,
                        timestampFormat: e.target.value as "IST" | "UTC",
                      })
                    }
                    className="w-full h-[38px] px-3 pr-8 rounded-[8px] bg-white border border-[#E4E0DB] text-xs text-[#111111] focus:border-[#FF5A1F] cursor-pointer appearance-none"
                  >
                    <option value="IST">Indian Standard Time (IST, UTC+05:30)</option>
                    <option value="UTC">Coordinated Universal Time (UTC+00:00)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none" />
                </div>
                <p className="text-[11px] text-[#6B6667] mt-1">
                  Applied to timestamps across dispatch and order logs.
                </p>
              </div>
            </div>

            <div className="h-[1px] bg-[#E4E0DB]" />

            {/* Operational Toggles */}
            <div className="space-y-3">
              {/* Toggle 1: High Density Rows */}
              <div className="flex items-center justify-between p-3.5 rounded-[8px] border border-[#E4E0DB] bg-[#F9F9F7]">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-[6px] bg-[#F4F1EA] text-[#111111] mt-0.5">
                    <Layers className="w-4 h-4 text-[#6B6667]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#111111] block">
                      High-Density Table Rows
                    </span>
                    <span className="text-[11px] text-[#6B6667] block mt-0.5">
                      Reduce row padding across Orders, Delivery Partners, and Catalog tables for dense viewports.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    savePreferences({
                      ...preferences,
                      highDensityRows: !preferences.highDensityRows,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.highDensityRows ? "bg-[#FF5A1F]" : "bg-[#E4E0DB]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.highDensityRows ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Audio Alert on Critical Exception */}
              <div className="flex items-center justify-between p-3.5 rounded-[8px] border border-[#E4E0DB] bg-[#F9F9F7]">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-[6px] bg-[#F4F1EA] text-[#111111] mt-0.5">
                    <Volume2 className="w-4 h-4 text-[#6B6667]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#111111] block">
                      Audio Alert on Order Exceptions
                    </span>
                    <span className="text-[11px] text-[#6B6667] block mt-0.5">
                      Play audio chime when high-priority order exception or dispute ticket arrives.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    savePreferences({
                      ...preferences,
                      audioAlertExceptions: !preferences.audioAlertExceptions,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.audioAlertExceptions ? "bg-[#FF5A1F]" : "bg-[#E4E0DB]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.audioAlertExceptions
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION C: Session Controls ================= */}
        <section className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-[#E4E0DB] flex items-center justify-between bg-[#F9F9F7]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[6px] bg-[#F4F1EA] flex items-center justify-center text-[#111111]">
                <Shield className="w-4 h-4 text-[#6B6667]" />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-[#111111]">
                  Session Controls
                </h2>
                <p className="text-[11px] text-[#6B6667]">
                  Active session details and credential rotation controls
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-[4px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#20885A] text-xs font-medium">
              Session Active
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Active Administrative Session Details Table */}
            <div>
              <div className="text-[11px] font-medium text-[#6B6667] uppercase tracking-wider mb-2">
                ACTIVE ADMINISTRATIVE SESSION
              </div>
              <div className="border border-[#E4E0DB] rounded-[8px] overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="h-10 bg-[#F9F9F7] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                      <th className="px-4">Network Gateway</th>
                      <th className="px-4">Session Initiated</th>
                      <th className="px-4">Client Device</th>
                      <th className="px-4 text-right">Channel Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-[#111111]">
                    <tr className="h-11 sm:h-12 border-b border-[#E4E0DB] hover:bg-[#F9F9F7]/50 transition-colors">
                      <td className="px-4 font-mono font-medium">
                        {sessionInfo.gatewayIp}{" "}
                        <span className="text-[#6B6667] font-normal">
                          ({sessionInfo.networkName})
                        </span>
                      </td>
                      <td className="px-4">
                        {sessionInfo.sessionInitiated}{" "}
                        <span className="text-[11px] text-[#20885A] font-medium block">
                          Expires in {sessionInfo.expiresIn}
                        </span>
                      </td>
                      <td className="px-4 text-[#6B6667] font-mono text-[11px]">
                        {sessionInfo.clientDevice}
                      </td>
                      <td className="px-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                          {sessionInfo.channelStatus}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-[11px] text-[#6B6667]">
                Actions here rotate credentials or terminate local authentication tokens.
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTokenModalOpen(true)}
                  className="h-9 px-3.5 rounded-[8px] bg-white border border-[#E4E0DB] text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#6B6667]" />
                  <span>Regenerate Session Auth Token</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(true)}
                  className="h-9 px-3.5 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] text-[#DA1E28] text-xs font-medium hover:bg-[#DA1E28] hover:text-white transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out All Active Sessions</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION D: Governance & System Boundaries ================= */}
        <section className="rounded-[10px] border border-[#E4E0DB] bg-[#FFFBEB] p-5 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#FEF3C7] border border-[#FDE68A] text-[#C9822E] flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-[#C9822E]" />
            </div>
            <div className="flex-1 space-y-2.5">
              <div>
                <h3 className="text-[14px] font-semibold text-[#111111] flex items-center gap-2">
                  <span>System Boundaries & Governance Notice</span>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#FEF3C7] text-[#C9822E] border border-[#FDE68A] text-[10px] font-medium">
                    POLICY NOTICE
                  </span>
                </h3>
                <p className="text-xs text-[#5B4038] mt-1 leading-relaxed">
                  Marketplace business policies—including commission take-rates, automated settlement cycles, and dynamic delivery fee thresholds—are authoritative backend parameters governed exclusively by platform configuration deployment pipelines.
                </p>
              </div>

              {/* Quick Verification Links */}
              <div className="flex items-center gap-4 pt-1 flex-wrap text-xs">
                <Link
                  href="/admin/audit"
                  className="inline-flex items-center gap-1.5 text-[#D94B17] hover:underline font-medium"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View Platform Audit Log (/admin/audit)</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-8 py-5 border-t border-[#E4E0DB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6667]">
        <div>
          KudiCart Operations Central Management
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#20885A]" />
            Frontend-Only Evaluation Build
          </span>
          <span>Access Level: SuperAdmin</span>
        </div>
      </footer>

      {/* Token Modal */}
      {tokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[8px] bg-[#EFF6FF] text-[#0043CE] flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-[#0043CE]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Session Token Rotation Notice
                </h3>
                <p className="text-xs text-[#6B6667]">
                  Backend API contract dependency
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] text-xs text-[#B45309] space-y-1.5">
              <p className="font-medium">
                Not connected in this build
              </p>
              <p className="text-[11px] leading-relaxed">
                Cryptographic session token regeneration requires live backend authentication services. In this frontend-only build, session tokens are simulated locally.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTokenModalOpen(false)}
                className="px-4 py-2 bg-[#111111] text-white rounded-[8px] text-xs font-medium hover:bg-[#333333] transition-colors"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[8px] bg-[#FEF2F2] text-[#DA1E28] flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4 text-[#DA1E28]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Sign Out Active Session?
                </h3>
                <p className="text-xs text-[#6B6667]">
                  Terminate Central Operations Administrator access
                </p>
              </div>
            </div>

            <p className="text-xs text-[#6B6667] leading-relaxed">
              This will clear local session storage and return you to the KudiCart authentication screen.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-[#DA1E28] hover:bg-[#b0161e] text-white rounded-[8px] text-xs font-medium transition-colors"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
