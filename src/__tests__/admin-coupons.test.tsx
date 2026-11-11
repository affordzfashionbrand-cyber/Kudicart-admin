import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sentry", () => ({
  captureClientError: vi.fn(),
  initClientSentry: vi.fn(),
}));

import { api } from "@/lib/api";
import AdminCouponsPage from "@/app/admin/coupons/page";

describe("Admin Coupons CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists, creates, toggles status, and deletes coupons via API", async () => {
    const user = userEvent.setup();

    vi.spyOn(api.coupons, "list").mockResolvedValueOnce({
      data: [
        {
          id: "cpn-1",
          code: "WELCOME10",
          discountType: "PERCENTAGE",
          discountValue: 10,
          minOrderValue: 499,
          maxDiscount: 200,
          usageLimit: 100,
          usedCount: 12,
          startDate: "2026-11-01T00:00:00.000Z",
          endDate: "2026-12-31T23:59:59.999Z",
          isActive: true,
          status: "ACTIVE",
        },
      ],
      total: 1,
    });

    const createSpy = vi.spyOn(api.coupons, "create").mockResolvedValueOnce({
      success: true,
      message: "Coupon SAVE20 created",
      coupon: {
        id: "cpn-2",
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderValue: 999,
        maxDiscount: 300,
        usageLimit: null,
        usedCount: 0,
        startDate: "2026-11-11T00:00:00.000Z",
        endDate: "2026-12-31T23:59:59.999Z",
        isActive: true,
        status: "ACTIVE",
      },
    });

    const updateSpy = vi.spyOn(api.coupons, "update").mockResolvedValueOnce({
      success: true,
      message: "Updated",
      coupon: {
        id: "cpn-1",
        code: "WELCOME10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderValue: 499,
        maxDiscount: 200,
        usageLimit: 100,
        usedCount: 12,
        startDate: "2026-11-01T00:00:00.000Z",
        endDate: "2026-12-31T23:59:59.999Z",
        isActive: false,
        status: "INACTIVE",
      },
    });

    const deleteSpy = vi.spyOn(api.coupons, "delete").mockResolvedValueOnce({
      success: true,
      message: "Coupon deleted",
    });

    render(<AdminCouponsPage />);

    expect(await screen.findByText("WELCOME10")).toBeInTheDocument();

    // Create a new coupon
    await user.click(screen.getByRole("button", { name: /create coupon/i }));
    await user.type(screen.getByLabelText(/coupon code/i), "save20");
    const valueInput = screen.getByLabelText(/discount value/i);
    await user.clear(valueInput);
    await user.type(valueInput, "20");
    const minOrderInput = screen.getByLabelText(/minimum order value/i);
    await user.clear(minOrderInput);
    await user.type(minOrderInput, "999");
    await user.type(screen.getByLabelText(/max discount cap/i), "300");

    await user.click(screen.getByRole("button", { name: /save coupon/i }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "SAVE20",
          discountType: "PERCENTAGE",
          discountValue: 20,
          minOrderValue: 999,
          maxDiscount: 300,
          isActive: true,
        })
      );
      expect(screen.getByText("SAVE20")).toBeInTheDocument();
    });

    // Toggle active -> inactive on WELCOME10
    await user.click(screen.getAllByRole("button", { name: /^deactivate$/i })[1]);
    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith("cpn-1", { isActive: false });
    });

    // Delete SAVE20
    await user.click(screen.getByRole("button", { name: /delete save20/i }));
    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith("cpn-2");
      expect(screen.queryByText("SAVE20")).not.toBeInTheDocument();
    });
  });
});
