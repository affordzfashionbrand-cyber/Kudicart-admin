"use client";

export function initClientSentry(): void {
  // Sentry descoped per DCR-016
}

export function captureClientError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (typeof window !== "undefined") {
    console.error("[ClientError]", error, context);
  }
}
