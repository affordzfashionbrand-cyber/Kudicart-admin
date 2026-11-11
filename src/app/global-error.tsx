"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F7F5] text-[#111111] flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full bg-white border border-[#E4E0DB] rounded-[12px] p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF5A1F]">
              Application Error
            </p>
            <h1 className="text-lg font-semibold text-[#111111]">
              Something went wrong
            </h1>
            <p className="text-xs text-[#6B6667]">
              An unexpected error occurred while rendering this portal view.
            </p>
          </div>
          {error.digest && (
            <p className="text-[11px] font-mono text-[#6B6667] bg-[#F7F7F5] px-2.5 py-1.5 rounded-[6px] border border-[#E4E0DB]">
              Ref: {error.digest}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => reset()}
              className="h-9 px-4 rounded-[8px] bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium transition-colors"
            >
              Try again
            </button>
            <a
              href="/login"
              className="h-9 px-4 rounded-[8px] border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] flex items-center transition-colors"
            >
              Return to sign in
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
