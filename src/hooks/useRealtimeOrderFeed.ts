"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, getAuthToken } from "@/lib/api";

function resolveTrackingWsUrl(token: string): string {
  const httpBase = API_BASE_URL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  const wsBase = httpBase.startsWith("https://")
    ? httpBase.replace("https://", "wss://")
    : httpBase.startsWith("http://")
      ? httpBase.replace("http://", "ws://")
      : `ws://${httpBase}`;
  return `${wsBase}/ws/tracking?token=${encodeURIComponent(token)}`;
}

/**
 * Connects Admin / Vendor portal views to the backend `/ws/tracking` live feed
 * so incoming orders, auto-assignments, pickups, Try & Buy events, and returns refresh immediately.
 */
export function useRealtimeOrderFeed(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const lastSeqRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const token = getAuthToken();
    if (!token) return;

    let ws: WebSocket | null = null;
    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;

    const connect = () => {
      if (closed) return;
      const latestToken = getAuthToken();
      if (!latestToken) return;

      try {
        ws = new WebSocket(resolveTrackingWsUrl(latestToken));
      } catch {
        return;
      }

      ws.onopen = () => {
        ws?.send(JSON.stringify({ type: "SUBSCRIBE_FEED", token: latestToken }));
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "PING" }));
          }
        }, 25_000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data || "{}"));
          const type = String(msg?.type || "");
          if (
            type === "ORDER_STATUS_UPDATE" ||
            type === "ORDER_ACCEPTED" ||
            type === "DELIVERY_ASSIGNMENT_CREATED" ||
            type === "DELIVERY_ASSIGNMENT_FAILED" ||
            type === "ORDER_READY_FOR_PICKUP" ||
            type === "ORDER_PICKED_UP" ||
            type === "ORDER_OUT_FOR_DELIVERY" ||
            type === "TRY_AND_BUY_STARTED" ||
            type === "TRY_AND_BUY_UPDATED" ||
            type === "ORDER_ARRIVED" ||
            type === "ORDER_DELIVERED" ||
            type === "ORDER_RETURNED"
          ) {
            const ordId = String(msg?.orderId || "global");
            const seq = typeof msg?.seq === "number" ? msg.seq : 0;
            const prev = lastSeqRef.current.get(ordId) ?? -1;
            if (seq > 0 && seq <= prev) return;
            if (seq > 0) lastSeqRef.current.set(ordId, seq);

            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin-assignments"] });
            queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
            queryClient.invalidateQueries({ queryKey: ["vendor-header-meta"] });
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = (ev) => {
        if (pingTimer) {
          clearInterval(pingTimer);
          pingTimer = null;
        }
        if (!closed && ev.code !== 4001 && ev.code !== 4003) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (pingTimer) clearInterval(pingTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        ws?.close();
      } catch {
        // ignore close errors
      }
    };
  }, [enabled, queryClient]);
}
