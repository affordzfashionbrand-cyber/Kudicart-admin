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
});
