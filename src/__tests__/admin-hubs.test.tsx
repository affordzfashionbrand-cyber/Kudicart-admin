import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sentry", () => ({
  captureClientError: vi.fn(),
  initClientSentry: vi.fn(),
}));

import { api } from "@/lib/api";
import AdminHubsPage from "@/app/admin/hubs/page";

describe("Admin Dark Store Hubs CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists hubs, creates a new hub, toggles active state, and deletes/soft-deactivates", async () => {
    const user = userEvent.setup();

    const listSpy = vi.spyOn(api.hubs, "list").mockResolvedValueOnce({
      success: true,
      total: 1,
      data: [
        {
          id: "hub-1",
          name: "Andheri West Hub",
          locality: "Andheri West",
          address: "Plot 12, Link Road, Mumbai",
          lat: 19.1197,
          lng: 72.8464,
          deliveryMinutes: 30,
          isActive: true,
        },
      ],
    });

    const createSpy = vi.spyOn(api.hubs, "create").mockResolvedValueOnce({
      success: true,
      message: "Hub created",
      data: {
        id: "hub-2",
        name: "Bandra Dark Store 01",
        locality: "Bandra West",
        address: "42 Hill Road, Mumbai",
        lat: 19.0596,
        lng: 72.8295,
        deliveryMinutes: 25,
        isActive: true,
      },
    });

    const updateSpy = vi.spyOn(api.hubs, "update").mockResolvedValueOnce({
      success: true,
      message: "Hub updated",
      data: {
        id: "hub-1",
        name: "Andheri West Hub",
        locality: "Andheri West",
        address: "Plot 12, Link Road, Mumbai",
        lat: 19.1197,
        lng: 72.8464,
        deliveryMinutes: 30,
        isActive: false,
      },
    });

    const deleteSpy = vi.spyOn(api.hubs, "delete").mockResolvedValueOnce({
      success: true,
      message: "Hub removed",
      data: null,
    });

    render(<AdminHubsPage />);

    expect(await screen.findByText("Andheri West Hub")).toBeInTheDocument();
    expect(listSpy).toHaveBeenCalledWith(true);

    // Create hub
    await user.click(screen.getByRole("button", { name: /add dark store hub/i }));
    await user.type(screen.getByLabelText(/hub name/i), "Bandra Dark Store 01");
    await user.type(screen.getByLabelText(/locality/i), "Bandra West");
    await user.type(screen.getByLabelText(/street address/i), "42 Hill Road, Mumbai");
    await user.type(screen.getByLabelText(/latitude/i), "19.0596");
    await user.type(screen.getByLabelText(/longitude/i), "72.8295");
    const slaInput = screen.getByLabelText(/dispatch sla/i);
    await user.clear(slaInput);
    await user.type(slaInput, "25");

    await user.click(screen.getByRole("button", { name: /save hub/i }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        name: "Bandra Dark Store 01",
        locality: "Bandra West",
        address: "42 Hill Road, Mumbai",
        lat: 19.0596,
        lng: 72.8295,
        deliveryMinutes: 25,
        isActive: true,
      });
      expect(screen.getByText("Bandra Dark Store 01")).toBeInTheDocument();
    });

    // Deactivate Andheri hub (second row after prepending created hub)
    await user.click(screen.getAllByRole("button", { name: /^deactivate$/i })[1]);
    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith("hub-1", { isActive: false });
    });

    // Delete Bandra hub
    await user.click(
      screen.getByRole("button", { name: /delete bandra dark store 01/i })
    );
    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith("hub-2");
      expect(screen.queryByText("Bandra Dark Store 01")).not.toBeInTheDocument();
    });
  });
});
