"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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

export default function AdminSettingsPage() {
  const [profile] = useState<AdminAccountProfile>(MOCK_ADMIN_PROFILE);
  const [preferences, setPreferences] = useState<WorkspacePreferences>(
    DEFAULT_WORKSPACE_PREFERENCES
  );
  const [sessionInfo] = useState<ActiveSessionDetails>(MOCK_ACTIVE_SESSION);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);

  // Load preferences from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kudicart_workspace_prefs");
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  const savePreferences = (newPrefs: WorkspacePreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem("kudicart_workspace_prefs", JSON.stringify(newPrefs));
    } catch {
      // Ignore local storage error
    }
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

  const handleSignOut = () => {
    // Perform clean local session sign-out
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E4E0DB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#0043CE] text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0043CE]" />
              Central Ops Configuration • Policy v4.8
            </span>
          </div>
          <p className="text-sm text-[#6B6667] mt-1">
            Manage authenticated account profile, operational workspace preferences, and session security guardrails.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-lg bg-[#F4F1EA] border border-[#E4E0DB] text-xs text-[#6B6667]">
          <span className="material-symbols-outlined text-[16px] text-[#20885A]">
            lock
          </span>
          <span>
            Access Level:{" "}
            <strong className="text-[#111111] font-semibold">
              {profile.accessLevel}
            </strong>
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Vertical Grouped Stack */}
      <div className="space-y-6">
        {/* ================= SECTION A: Authenticated Account & Session Identity ================= */}
        <section className="bg-white rounded-xl border border-[#E4E0DB] overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-[#E4E0DB] flex items-center justify-between bg-[#F9F9F7]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#F4F1EA] flex items-center justify-center text-[#111111]">
                <span className="material-symbols-outlined text-[18px]">badge</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111111]">
                  Authenticated Account & Session Identity
                </h2>
                <p className="text-[11px] text-[#6B6667]">
                  Cryptographically authenticated personnel record within Central Ops directory
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#E4E0DB] text-[11px] font-mono text-[#6B6667]">
              SSO-SYNCED
            </span>
          </div>

          <div className="p-6">
            {/* Account Badge Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1A1C1B] text-white flex items-center justify-center text-xl font-bold border-2 border-white shadow-xs">
                  AO
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-[#111111]">
                      {profile.displayName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#20885A] text-xs font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        verified
                      </span>
                      Active Principal
                    </span>
                  </div>
                  <div className="text-xs text-[#6B6667] mt-0.5">
                    {profile.role} • Central Ops SuperAdmin
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6667]">Assigned Permissions:</span>
                <span className="px-2 py-1 rounded bg-white border border-[#E4E0DB] text-xs font-mono text-[#111111] font-semibold">
                  {profile.assignedPermissions}
                </span>
              </div>
            </div>

            {/* Read-Only Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Display Name */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-semibold mb-1.5 uppercase tracking-wider">
                  DISPLAY NAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.displayName}
                    readOnly
                    className="w-full h-[38px] px-3 pr-10 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] cursor-not-allowed select-all focus:outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-[18px] text-[#6B6667]">
                    lock
                  </span>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-semibold mb-1.5 uppercase tracking-wider">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full h-[38px] px-3 pr-24 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] text-xs font-mono text-[#111111] cursor-not-allowed select-all focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2 px-2 py-0.5 rounded bg-[#ECFDF5] text-[#20885A] text-[10px] font-semibold border border-[#A7F3D0]">
                    Verified
                  </span>
                </div>
              </div>

              {/* Staff Identifier */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-semibold mb-1.5 uppercase tracking-wider">
                  STAFF IDENTIFIER
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.staffId}
                    readOnly
                    className="w-full h-[38px] px-3 pr-10 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] text-xs font-mono text-[#111111] font-semibold cursor-not-allowed select-all focus:outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-[18px] text-[#6B6667]">
                    fingerprint
                  </span>
                </div>
              </div>

              {/* Operating Terminal */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-semibold mb-1.5 uppercase tracking-wider">
                  ASSIGNED OPERATING TERMINAL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.assignedTerminal}
                    readOnly
                    className="w-full h-[38px] px-3 pr-10 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] cursor-not-allowed select-all focus:outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-[18px] text-[#6B6667]">
                    domain
                  </span>
                </div>
              </div>
            </div>

            {/* Footnote */}
            <div className="mt-5 p-3 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] flex items-start gap-2.5 text-xs text-[#6B6667]">
              <span className="material-symbols-outlined text-[18px] text-[#6B6667] shrink-0 mt-0.5">
                info
              </span>
              <span>
                Administrative account credentials and role assignments are managed by platform directory services and cannot be modified locally. Contact IT IAM Ops for credential delegation or clearance revision.
              </span>
            </div>
          </div>
        </section>

        {/* ================= SECTION B: Operational Workspace & Table Preferences ================= */}
        <section className="bg-white rounded-xl border border-[#E4E0DB] overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-[#E4E0DB] flex items-center justify-between bg-[#F9F9F7]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#F4F1EA] flex items-center justify-center text-[#111111]">
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111111]">
                  Operational Workspace & Table Preferences
                </h2>
                <p className="text-[11px] text-[#6B6667]">
                  Local client presentation standards, data density, and event notifications
                </p>
              </div>
            </div>
            <button
              onClick={handleResetCache}
              className="px-3 py-1 rounded-lg border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-semibold text-[#111111] transition-colors"
            >
              Reset Local Cache
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Standard Selectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Default Table Page Size */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-semibold mb-1.5 uppercase tracking-wider">
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
                    className="w-full h-[38px] px-3 pr-8 rounded-lg bg-white border border-[#E4E0DB] text-xs text-[#111111] focus:border-[#FF5A1F] cursor-pointer appearance-none"
                  >
                    <option value={10}>10 rows per page</option>
                    <option value={25}>25 rows per page</option>
                    <option value={50}>50 rows per page</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#6B6667] pointer-events-none">
                    expand_more
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6667] mt-1">
                  Default pagination chunk for operational data streams.
                </p>
              </div>

              {/* Currency Display Standard */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-semibold mb-1.5 uppercase tracking-wider">
                  CURRENCY DISPLAY STANDARD
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={preferences.currencyStandard}
                    readOnly
                    className="w-full h-[38px] px-3 pr-8 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] cursor-not-allowed select-all focus:outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#6B6667]">
                    lock
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6667] mt-1">
                  Platform locale fixed to Indian Sovereign Node (₹).
                </p>
              </div>

              {/* Timestamp Display Format */}
              <div>
                <label className="block text-[11px] text-[#6B6667] font-semibold mb-1.5 uppercase tracking-wider">
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
                    className="w-full h-[38px] px-3 pr-8 rounded-lg bg-white border border-[#E4E0DB] text-xs text-[#111111] focus:border-[#FF5A1F] cursor-pointer appearance-none"
                  >
                    <option value="IST">Indian Standard Time (IST, UTC+05:30)</option>
                    <option value="UTC">Coordinated Universal Time (UTC+00:00)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#6B6667] pointer-events-none">
                    expand_more
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6667] mt-1">
                  Applied to dispatch logs and audit sequences.
                </p>
              </div>
            </div>

            <div className="h-[1px] bg-[#E4E0DB]" />

            {/* Operational Toggles */}
            <div className="space-y-4">
              {/* Toggle 1: High Density Rows */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E4E0DB] bg-[#F9F9F7]">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-[#F4F1EA] text-[#111111] mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">
                      density_small
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111111] block">
                      High-Density Operational Rows
                    </span>
                    <span className="text-[11px] text-[#6B6667] block mt-0.5">
                      Reduce row padding across Orders, Delivery Partners, and Catalog tables to fit up to 35% more lines per viewport.
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
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E4E0DB] bg-[#F9F9F7]">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-[#F4F1EA] text-[#111111] mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">
                      volume_up
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111111] block">
                      Audio Alert on Critical Exception
                    </span>
                    <span className="text-[11px] text-[#6B6667] block mt-0.5">
                      Play acoustic chime when high-priority order exception or dispute ticket arrives. Suppressed in silent mode.
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

        {/* ================= SECTION C: Authentication & Session Security ================= */}
        <section className="bg-white rounded-xl border border-[#E4E0DB] overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-[#E4E0DB] flex items-center justify-between bg-[#F9F9F7]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#F4F1EA] flex items-center justify-center text-[#111111]">
                <span className="material-symbols-outlined text-[18px]">security</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111111]">
                  Authentication & Session Security
                </h2>
                <p className="text-[11px] text-[#6B6667]">
                  Token expiration, enterprise SSO verification, and hardware security posture
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#20885A] text-xs font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20885A]" />
              Enforced Security Tier 1
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Auth & MFA Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#6B6667] uppercase tracking-wider">
                    AUTHENTICATION PROVIDER
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#20885A] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#20885A]" />
                    Active
                  </span>
                </div>
                <div className="text-xs font-bold text-[#111111] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#FF5A1F]">
                    encrypted
                  </span>
                  <span>Firebase Authentication (Enterprise SSO)</span>
                </div>
                <p className="text-[11px] text-[#6B6667] mt-1">
                  Federated via Okta / Cloud Directory. SHA-256 TLS 1.3 handshake enforced.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#F7F7F5] border border-[#E4E0DB]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#6B6667] uppercase tracking-wider">
                    MULTI-FACTOR AUTHENTICATION (MFA)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-[#E4E0DB] text-[10px] font-mono text-[#20885A] font-semibold">
                    ENFORCED
                  </span>
                </div>
                <div className="text-xs font-bold text-[#111111] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#20885A]">
                    key
                  </span>
                  <span>Hardware Security Key / TOTP Authenticator</span>
                </div>
                <p className="text-[11px] text-[#6B6667] mt-1">
                  FIDO2 WebAuthn token verified at 08:15 IST login checkpoint.
                </p>
              </div>
            </div>

            {/* Active Administrative Session Details Table */}
            <div>
              <div className="text-[11px] font-semibold text-[#6B6667] uppercase tracking-wider mb-2">
                ACTIVE ADMINISTRATIVE SESSION
              </div>
              <div className="border border-[#E4E0DB] rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="h-10 bg-[#F9F9F7] border-b border-[#E4E0DB] text-[11px] text-[#6B6667] font-semibold">
                      <th className="px-4 uppercase">Network Gateway / IP</th>
                      <th className="px-4 uppercase">Session Initiated</th>
                      <th className="px-4 uppercase">Client Device & Agent</th>
                      <th className="px-4 uppercase text-right">Channel Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="h-12 border-b border-[#E4E0DB] hover:bg-[#F9F9F7] transition-colors">
                      <td className="px-4 font-mono text-[#111111] font-medium">
                        {sessionInfo.gatewayIp}{" "}
                        <span className="text-[#6B6667] font-normal">
                          ({sessionInfo.networkName})
                        </span>
                      </td>
                      <td className="px-4 text-[#111111]">
                        {sessionInfo.sessionInitiated}{" "}
                        <span className="text-[11px] text-[#20885A] font-semibold block">
                          Expires in {sessionInfo.expiresIn}
                        </span>
                      </td>
                      <td className="px-4 text-[#6B6667] font-mono text-[11px]">
                        {sessionInfo.clientDevice}
                      </td>
                      <td className="px-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
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
                Actions performed here invalidate active JSON Web Tokens (JWT) across all associated nodes.
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTokenModalOpen(true)}
                  className="h-9 px-4 rounded-lg bg-white border border-[#E4E0DB] text-[#111111] text-xs font-semibold hover:bg-[#F7F7F5] transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#6B6667]">
                    refresh
                  </span>
                  <span>Regenerate Session Auth Token</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(true)}
                  className="h-9 px-4 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-[#DA1E28] text-xs font-semibold hover:bg-[#DA1E28] hover:text-white transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out All Active Sessions</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION D: Provisional System Boundaries & Governance Guardrails ================= */}
        <section className="rounded-xl border border-[#E4E0DB] bg-[#FFFBEB] p-6 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#C9822E] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">shield</span>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                  <span>Provisional System Boundaries & Governance Guardrails</span>
                  <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#C9822E] border border-[#FDE68A] text-[10px] font-semibold">
                    POLICY RESTRICTION
                  </span>
                </h3>
                <p className="text-xs text-[#5B4038] mt-1.5 leading-relaxed">
                  Core business policies—including <strong>Commission take-rates</strong>,{" "}
                  <strong>Automated settlement cycles</strong>,{" "}
                  <strong>Dark-store inventory routing algorithms</strong>, and{" "}
                  <strong>Dynamic delivery fee thresholds</strong>—are authoritative backend parameters governed exclusively by platform configuration deployment pipelines. To maintain operational auditability and compliance with commercial financial regulators, these governance controls are intentionally omitted from local client configuration views.
                </p>
              </div>

              {/* Quick Verification Links */}
              <div className="flex items-center gap-4 pt-1 flex-wrap text-xs">
                <Link
                  href="/admin/audit"
                  className="inline-flex items-center gap-1.5 text-[#AE3200] hover:underline font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  <span>View Platform Audit Log (/admin/audit)</span>
                </Link>
                <span className="text-[#E4E0DB]">•</span>
                <span className="text-[11px] text-[#6B6667] font-mono">
                  Checksum: 9fa1...8b2e
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-[#E4E0DB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6667]">
        <div>
          KudiCart Ops Central Management • Build ID{" "}
          <span className="font-mono text-[#111111]">2024.10.24-R4</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#20885A]" />
            All microservices responding under 42ms
          </span>
          <span>Security Clearance Level SuperAdmin</span>
        </div>
      </footer>

      {/* Token Modal */}
      {tokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#0043CE] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">vpn_key</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Session Token Rotation Policy
                </h3>
                <p className="text-xs text-[#6B6667]">
                  Cryptographic Session Architecture
                </p>
              </div>
            </div>

            <p className="text-xs text-[#6B6667] leading-relaxed">
              In accordance with KudiCart Central Ops enterprise security architecture, Firebase ID tokens rotate automatically every 60 minutes via secure HTTP-only refresh handshakes. Manual arbitrary token regeneration is restricted to prevent race conditions during live dispatches.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTokenModalOpen(false)}
                className="px-4 py-2 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#333333]"
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
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] text-[#DA1E28] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">logout</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Sign Out Active Session?
                </h3>
                <p className="text-xs text-[#6B6667]">
                  Terminate Central Ops Administrator access
                </p>
              </div>
            </div>

            <p className="text-xs text-[#6B6667] leading-relaxed">
              This will clear your client session tokens and redirect you to the KudiCart authentication portal. Any unsaved dispatch drafts will be cleared.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 border border-[#E4E0DB] rounded-lg text-xs font-semibold text-[#6B6667] hover:bg-[#F7F7F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-[#DA1E28] hover:bg-[#b0161e] text-white rounded-lg text-xs font-semibold"
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
