import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sentry", () => ({
  captureClientError: vi.fn(),
  initClientSentry: vi.fn(),
}));

import { api } from "@/lib/api";
import AdminSupportPage from "@/app/admin/support/page";

describe("Admin Support Ticket Resolution (CLOSED + resolutionRemarks)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays CLOSED tab and submits CLOSED status with resolutionRemarks", async () => {
    const user = userEvent.setup();

    vi.spyOn(api.support, "list").mockResolvedValueOnce({
      total: 1,
      page: 1,
      limit: 100,
      data: [
        {
          id: "TICK-901",
          timeAgo: "10m ago",
          createdAt: "2026-11-11T10:00:00.000Z",
          customerName: "Meera Nair",
          customerEmail: "meera@example.com",
          customerPhone: "9876500001",
          customerNumber: "CUS-101",
          customerTier: "Standard",
          location: "Indiranagar, Bengaluru",
          category: "DELIVERY",
          orderNumber: "#KC-4402",
          orderProductSummary: "1x Cotton Saree",
          orderAmount: 3200,
          orderDeliveryStatus: "DELIVERED",
          status: "IN_PROGRESS",
          priority: "HIGH",
          assignee: "Ops Desk",
          subject: "Delivery partner arrival verification",
          description: "Customer requested proof of handover receipt.",
        },
      ],
    });

    const updateSpy = vi
      .spyOn(api.support, "updateTicket")
      .mockResolvedValueOnce({
        success: true,
        ticket: { id: "TICK-901", status: "CLOSED" },
      });

    render(<AdminSupportPage />);

    const ticketNodes = await screen.findAllByText("TICK-901");
    expect(ticketNodes.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /closed\s*0/i })).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/add internal resolution note/i),
      "Confirmed receipt shared with customer"
    );
    await user.click(screen.getByRole("button", { name: /close ticket/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith("TICK-901", {
        status: "CLOSED",
        resolutionRemarks: "Confirmed receipt shared with customer",
      });
      expect(
        screen.getByText("Confirmed receipt shared with customer")
      ).toBeInTheDocument();
    });
  });

  it("supports sending an admin reply via Send Reply while keeping OPEN or IN_PROGRESS status", async () => {
    const user = userEvent.setup();

    vi.spyOn(api.support, "list").mockResolvedValueOnce({
      total: 1,
      page: 1,
      limit: 100,
      data: [
        {
          id: "TICK-902",
          timeAgo: "2m ago",
          createdAt: "2026-11-11T10:05:00.000Z",
          customerName: "Rohan Verma",
          customerEmail: "rohan@example.com",
          customerPhone: "9876500002",
          customerNumber: "CUS-102",
          customerTier: "Atelier",
          location: "Koramangala, Bengaluru",
          category: "TRY_AND_BUY",
          orderNumber: "#KC-5501",
          orderProductSummary: "1x Silk Kurta",
          orderAmount: 4500,
          orderDeliveryStatus: "OUT_FOR_DELIVERY",
          status: "OPEN",
          priority: "URGENT",
          assignee: "Ops Desk",
          subject: "Need doorstep trial extension",
          description: "Rider arrived; need 5 extra minutes.",
        },
      ],
    });

    const updateSpy = vi
      .spyOn(api.support, "updateTicket")
      .mockResolvedValueOnce({
        success: true,
        ticket: { id: "TICK-902", status: "IN_PROGRESS", resolutionRemarks: "Extended trial window by 5 minutes" },
      });

    render(<AdminSupportPage />);

    expect((await screen.findAllByText("TICK-902")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("URGENT").length).toBeGreaterThanOrEqual(1);

    await user.type(
      screen.getByPlaceholderText(/add internal resolution note/i),
      "Extended trial window by 5 minutes"
    );
    await user.click(screen.getByRole("button", { name: /send reply/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith("TICK-902", {
        status: "IN_PROGRESS",
        resolutionRemarks: "Extended trial window by 5 minutes",
      });
    });
  });
});
