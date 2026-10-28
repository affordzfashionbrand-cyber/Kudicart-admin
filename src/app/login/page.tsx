"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Validation helpers
  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError("Work email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid work email address.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError("Password is required.");
      return false;
    }
    if (val.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  // Sign in submit — Validates credentials and routes to role-specific dashboard for preview/testing
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setInfoMessage(null);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail.includes("vendor")) {
        router.push("/vendor/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    }, 300);
  };

  // Forgot password click — Concise informational notice without faking reset
  const handleForgotPassword = () => {
    setInfoMessage("Password recovery is not connected in this build.");
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F7F7F5] selection:bg-[#FFF0E8] selection:text-[#D94B17]">
      {/* ========================================================================= */}
      {/* LEFT PANEL: KudiCart Brand Identity & Purpose                             */}
      {/* ========================================================================= */}
      <section className="w-full lg:w-[48%] xl:w-[46%] bg-[#F4F1EA] px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20 flex flex-col justify-center">
        <div className="w-full max-w-[440px] mx-auto lg:mx-0 space-y-6 sm:space-y-8">
          {/* Brand Wordmark & Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-white border border-[#E4E0DB] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#FF5A1F] text-[20px]"
                aria-hidden="true"
              >
                inventory_2
              </span>
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="font-serif text-[28px] text-[#111111] font-bold tracking-tight">
                KudiCart
              </span>
              <span
                className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF5A1F] ml-1.5 transform -translate-y-0.5"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Heading & Supporting Text */}
          <div className="space-y-3">
            <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-semibold text-[#111111] tracking-tight leading-[1.3]">
              Marketplace Operations for KudiCart
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#6B6667] leading-[1.55]">
              Manage orders, vendors, products, and marketplace activity in one place.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Authentication Form Card                                     */}
      {/* ========================================================================= */}
      <section className="flex-1 bg-[#F7F7F5] flex flex-col justify-center items-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white border border-[#E4E0DB] rounded-[14px] p-7 sm:p-9 shadow-xs">
          {/* Card Header */}
          <div className="mb-6">
            <h2 className="text-[24px] sm:text-[26px] font-semibold text-[#111111] tracking-tight leading-tight">
              Sign In to Your Portal
            </h2>
            <p className="text-[14px] text-[#6B6667] mt-1.5 leading-normal">
              Use your work email and password to continue.
            </p>
          </div>

          {/* Form Feedback — Shown after user action, concise and nontechnical */}
          {infoMessage && (
            <div
              role="status"
              className="mb-5 p-3 rounded-[8px] bg-[#F4F1EA] border border-[#E4E0DB] flex items-start gap-2.5 text-[13px] text-[#111111]"
            >
              <span
                className="material-symbols-outlined text-[18px] text-[#6B6667] shrink-0 mt-0.5"
                aria-hidden="true"
              >
                info
              </span>
              <span className="leading-snug">{infoMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form className="space-y-4" onSubmit={handleSignIn} noValidate>
            {/* Work Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="work-email"
                className="block text-[13px] sm:text-[14px] font-medium text-[#111111]"
              >
                Work Email Address
              </label>
              <div className="relative flex items-center">
                <span
                  className="material-symbols-outlined absolute left-3.5 text-[#6B6667] text-[18px] pointer-events-none"
                  aria-hidden="true"
                >
                  alternate_email
                </span>
                <input
                  id="work-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                    if (infoMessage) setInfoMessage(null);
                  }}
                  onBlur={() => validateEmail(email)}
                  placeholder="name@company.com"
                  className={cn(
                    "w-full h-[44px] pl-11 pr-3.5 bg-white border rounded-[8px] text-[14px] text-[#111111] placeholder:text-[#6B6667]/50 focus:outline-none transition-colors",
                    emailError
                      ? "border-[#DA1E28] focus:border-[#DA1E28] focus:ring-1 focus:ring-[#DA1E28]"
                      : "border-[#E4E0DB] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
                  )}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
              </div>
              {emailError && (
                <p id="email-error" className="text-[12px] text-[#DA1E28] font-medium">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[13px] sm:text-[14px] font-medium text-[#111111]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[13px] font-medium text-[#D94B17] hover:text-[#FF5A1F] hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F] rounded transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <span
                  className="material-symbols-outlined absolute left-3.5 text-[#6B6667] text-[18px] pointer-events-none"
                  aria-hidden="true"
                >
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                    if (infoMessage) setInfoMessage(null);
                  }}
                  onBlur={() => validatePassword(password)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full h-[44px] pl-11 pr-11 bg-white border rounded-[8px] text-[14px] text-[#111111] placeholder:text-[#6B6667]/50 focus:outline-none transition-colors",
                    passwordError
                      ? "border-[#DA1E28] focus:border-[#DA1E28] focus:ring-1 focus:ring-[#DA1E28]"
                      : "border-[#E4E0DB] focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
                  )}
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                <button
                  type="button"
                  id="togglePassword"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-2.5 p-1.5 rounded-[6px] hover:bg-[#F4F1EA] text-[#6B6667] hover:text-[#111111] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A1F]"
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    aria-hidden="true"
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="text-[12px] text-[#DA1E28] font-medium">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                id="submitBtn"
                disabled={isLoading}
                className="w-full h-[44px] bg-[#FF5A1F] hover:bg-[#D94B17] active:bg-[#C23E0E] active:scale-[0.99] text-white font-medium text-[14px] rounded-[8px] flex items-center justify-center gap-2 transition-colors duration-150 shadow-none border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span
                      className="animate-spin material-symbols-outlined text-[18px]"
                      aria-hidden="true"
                    >
                      progress_activity
                    </span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="pt-5 border-t border-[#E4E0DB] mt-6 text-center">
            <p className="text-[12px] text-[#6B6667]">
              Authorized marketplace accounts only.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
