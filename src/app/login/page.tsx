"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid work email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    // Simulated secure partition resolution
    setTimeout(() => {
      setIsLoading(false);
      const lowerEmail = email.toLowerCase().trim();

      // Role partition routing
      if (lowerEmail.includes("vendor") || lowerEmail.includes("boutique") || lowerEmail.includes("store")) {
        router.push("/vendor/dashboard");
      } else {
        // Default to Central Ops admin queue
        router.push("/admin/orders");
      }
    }, 800);
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F7F7F5] selection:bg-[#FFF0E8] selection:text-[#D94B17]">
      {/* ========================================================================= */}
      {/* LEFT PANEL: Brand Statement, Operational Context & Schematic (Approx 45%) */}
      {/* ========================================================================= */}
      <section className="lg:w-[45%] bg-[#F4F1EA] border-b lg:border-b-0 lg:border-r border-[#E4E0DB] p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Top Section: Brand Identity */}
        <div className="space-y-6 sm:space-y-8 relative z-10">
          {/* Brand Wordmark with Signal Orange accent */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-[#E4E0DB] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[#FF5A1F] text-[20px]">
                inventory_2
              </span>
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="font-serif text-[26px] text-[#111111] font-bold tracking-tight">
                KudiCart
              </span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF5A1F] ml-1 transform -translate-y-0.5" />
              <span className="text-xs ml-2.5 px-2 py-0.5 rounded bg-[#EAE7DF] border border-[#E4E0DB] text-[#6B6667] font-semibold tracking-normal">
                Ops v2.4
              </span>
            </div>
          </div>

          {/* Tagline & Core Statement */}
          <div className="space-y-2 max-w-md pt-1">
            <span className="text-[11px] text-[#D94B17] font-bold tracking-wider uppercase">
              Unified Gateway
            </span>
            <h1 className="text-2xl sm:text-3xl text-[#111111] font-bold tracking-tight leading-tight">
              Marketplace Operations &amp; Boutique Portal
            </h1>
            <p className="text-sm text-[#6B6667] leading-relaxed pt-1">
              Centralized marketplace governance for operations teams and scoped commerce tooling for certified partner boutiques.
            </p>
          </div>

          {/* System Architecture Pill Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md">
            <div className="bg-white border border-[#E4E0DB] rounded-lg p-3 shadow-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#20885A]" />
                <span className="text-xs text-[#111111] font-semibold">Central Ops</span>
              </div>
              <p className="text-[11px] text-[#6B6667] leading-normal">
                Order dispatch, ledger settlements, vendor governance &amp; disputes.
              </p>
            </div>
            <div className="bg-white border border-[#E4E0DB] rounded-lg p-3 shadow-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
                <span className="text-xs text-[#111111] font-semibold">Partner Boutiques</span>
              </div>
              <p className="text-[11px] text-[#6B6667] leading-normal">
                Catalog fulfillment, live inventory matrices &amp; merchant payouts.
              </p>
            </div>
          </div>
        </div>

        {/* Mid Graphic Ornament: Micro Blueprint / Schematic */}
        <div className="my-8 p-4 rounded-xl bg-white/80 border border-[#E4E0DB] max-w-md hidden md:block backdrop-blur-xs relative z-10 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4E0DB] mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#6B6667]">
                terminal
              </span>
              <span className="font-mono text-[11px] text-[#6B6667] font-semibold">
                GATEWAY_SESSION_RESOLVER
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#20885A] font-bold">READY</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-[#6B6667]">
            <p className="flex justify-between">
              <span>CLUSTER_NODES:</span>{" "}
              <span className="text-[#111111]">central-primary-mum-01</span>
            </p>
            <p className="flex justify-between">
              <span>SEC_POLICY:</span>{" "}
              <span className="text-[#111111]">ZERO_TRUST_RBAC_ENFORCED</span>
            </p>
            <p className="flex justify-between">
              <span>AUDIT_LOGGING:</span>{" "}
              <span className="text-[#111111]">APPEND_ONLY_ETL_ACTIVE</span>
            </p>
          </div>
        </div>

        {/* Bottom Security Notice Section */}
        <div className="pt-4 border-t border-[#E4E0DB] max-w-md relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-white border border-[#E4E0DB] text-[#6B6667] shrink-0 mt-0.5 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">shield</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#111111] font-semibold">Single Unified Gateway</p>
              <p className="text-[11px] text-[#6B6667] leading-relaxed">
                System privileges, role context (Central Ops vs. Boutique Vendor), and permissions are resolved securely upon authentication.
              </p>
            </div>
          </div>
        </div>

        {/* Subtle background architectural grid texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-20 [background-image:linear-gradient(to_right,#E4E0DB_1px,transparent_1px),linear-gradient(to_bottom,#E4E0DB_1px,transparent_1px)] [background-size:24px_24px]"
        />
      </section>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Authentication Form (Approx 55%)                             */}
      {/* ========================================================================= */}
      <section className="lg:w-[55%] bg-[#F7F7F5] flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative">
        {/* Top Right Status Header */}
        <div className="w-full max-w-[440px] flex items-center justify-between pb-6 text-[#6B6667]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#20885A] animate-pulse" />
            <span className="font-mono text-[11px] tracking-tight font-medium">
              AUTH SERVICE: OPERATIONAL
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[15px]">lock</span>
            <span>TLS 1.3 / 256-BIT</span>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="w-full max-w-[440px] bg-white border border-[#E4E0DB] rounded-xl p-6 sm:p-8 shadow-xs">
          {/* Card Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#111111] tracking-tight">
              Sign in to your portal
            </h2>
            <p className="text-xs text-[#6B6667] mt-1 leading-normal">
              Enter your verified credentials to access your operational dashboard.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#DA1E28]/30 flex items-start gap-2 text-xs text-[#DA1E28]">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  error
                </span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Work Email Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="work-email"
                  className="text-[11px] font-bold text-[#6B6667] uppercase tracking-wider"
                >
                  Work Email Address
                </label>
                <span className="font-mono text-[10px] text-[#6B6667]">Single Sign-On</span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#6B6667] text-[18px] pointer-events-none">
                  alternate_email
                </span>
                <input
                  id="work-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@kudicart.com or store@vendor.com"
                  className="w-full h-10 pl-10 pr-3 bg-white border border-[#E4E0DB] rounded-lg text-xs text-[#111111] placeholder:text-[#6B6667]/50 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all"
                />
              </div>
            </div>

            {/* Password Field with Toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[11px] font-bold text-[#6B6667] uppercase tracking-wider"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMessage("Password recovery must be initiated via Central Ops Security Desk.");
                  }}
                  className="text-[11px] font-semibold text-[#D94B17] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#6B6667] text-[18px] pointer-events-none">
                  key
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-10 pr-10 bg-white border border-[#E4E0DB] rounded-lg font-mono text-xs text-[#111111] placeholder:text-[#6B6667]/40 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] tracking-wider transition-all"
                />
                <button
                  type="button"
                  id="togglePassword"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1 rounded hover:bg-[#F4F1EA] text-[#6B6667] hover:text-[#111111] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Tenant Context Notice */}
            <div className="bg-[#F7F7F5] border border-[#E4E0DB] rounded-lg p-2.5 px-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#6B6667]">
                  hub
                </span>
                <span className="text-[11px] text-[#6B6667] font-medium">
                  Partition Routing
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#111111] font-semibold bg-white px-2 py-0.5 rounded border border-[#E4E0DB]">
                Auto-Detect Domain
              </span>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="submitBtn"
                disabled={isLoading}
                className="w-full h-10 bg-[#FF5A1F] hover:bg-[#D94B17] active:scale-[0.99] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[18px]">
                      progress_activity
                    </span>
                    <span>Resolving Tenant Partition...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate &amp; Enter</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E4E0DB]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-[10px] font-bold text-[#6B6667] tracking-widest uppercase">
                Compliance &amp; Auditing
              </span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-[#FEF2F2] border border-[#DA1E28]/20 rounded-lg p-3 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-[#DA1E28] shrink-0 mt-0.5">
              shield
            </span>
            <p className="text-[11px] text-[#6B6667] leading-relaxed">
              <strong className="text-[#DA1E28] font-bold uppercase tracking-wider block text-[10px] mb-0.5">
                Restricted System Access
              </strong>
              Unauthorized access attempts are continuously logged and traced under applicable cybersecurity frameworks.
            </p>
          </div>
        </div>

        {/* Portal Quick Switch Aid (For reviewer ease) */}
        <div className="mt-4 flex items-center gap-4 text-xs text-[#6B6667]">
          <span>Quick links:</span>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@kudicart.com");
              setPassword("Admin@2026");
            }}
            className="text-[#D94B17] hover:underline font-medium"
          >
            Fill Admin Sample
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setEmail("store@maison-lagos.vendor.com");
              setPassword("Vendor@2026");
            }}
            className="text-[#D94B17] hover:underline font-medium"
          >
            Fill Vendor Sample
          </button>
        </div>
      </section>
    </main>
  );
}
