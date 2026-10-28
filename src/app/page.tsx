"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#FF5A1F] text-2xl animate-spin">
          progress_activity
        </span>
        <span className="text-sm font-medium text-[#6B6667]">Loading KudiCart Ops...</span>
      </div>
    </div>
  );
}
