"use client";

import * as Sentry from "@sentry/nextjs";

let initialized = false;

export function initClientSentry(): void {
  if (initialized || typeof window === "undefined") {
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });

  initialized = true;
}

export function captureClientError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) {
    return;
  }
  initClientSentry();
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
