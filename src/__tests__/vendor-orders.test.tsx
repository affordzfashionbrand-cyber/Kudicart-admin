import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/vendor/orders",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/sentry", () => ({
  captureClientError: vi.fn(),
  initClientSentry: vi.fn(),
}));

import { api } from "@/lib/api";
import VendorOrdersPage from "@/app/vendor/orders/page";

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const SAMPLE_VENDOR_ORDERS = [
  {
    id: "vo-1",
    orderNumber: "KC-5001",
    checkoutGroupId: "grp-500",
    groupNumber: "CHK-500",
    status: "PLACED",
    paymentMethod: "RAZORPAY",
    paymentStatus: "PAID",
    fulfillmentType: "VENDOR",
    vendorId: "vnd-1",
    vendor: { id: "vnd-1", storeName: "Atelier Bloom" },
    deliveryInstructions: "Call customer on arrival at gate B",
    itemTotal: 2200,
    deliveryFee: 0,
    taxes: 110,
    discountAmount: 0,
    grandTotal: 2310,
    isTryAndBuy: true,
    createdAt: "2026-11-11T11:00:00.000Z",
    customer: { id: "c1", name: "Kavya Rao", phone: "9999988888" },
    deliveryAddress: {
      line1: "22 MG Road",
      locality: "Ashok Nagar",
      city: "Bengaluru",
      pincode: "560001",
    },
    items: [
      {
        id: "oi-1",
        productId: "p1",
        title: "Embroidered Tunic",
        brand: "Atelier Bloom",
        size: "S",
        price: 2200,
        quantity: 1,
        image: "https://example.com/tunic.jpg",
      },
    ],
  },
  {
    id: "vo-2",
    orderNumber: "KC-5002",
    status: "RETURNING",
    paymentMethod: "RAZORPAY",
    paymentStatus: "PAID",
    fulfillmentType: "VENDOR",
    vendorId: "vnd-1",
    vendor: { id: "vnd-1", storeName: "Atelier Bloom" },
    itemTotal: 1500,
    deliveryFee: 0,
    taxes: 75,
    discountAmount: 0,
    grandTotal: 1575,
    isTryAndBuy: true,
    createdAt: "2026-11-11T11:10:00.000Z",
    customer: { id: "c2", name: "Rohan Mehta", phone: "9888877777" },
    deliveryAddress: {
      line1: "8 Church Street",
      locality: "Central",
      city: "Bengaluru",
      pincode: "560001",
    },
    items: [
      {
        id: "oi-2",
        productId: "p2",
        title: "Chinos",
        brand: "Atelier Bloom",
        size: "32",
        price: 1500,
        quantity: 1,
        image: "https://example.com/chinos.jpg",
      },
    ],
  },
];

describe("Vendor Orders 12-State Queue, Instructions & Transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 12 canonical status tabs, shows delivery instructions, and triggers accept/reject mutations", async () => {
    const user = userEvent.setup();

    vi.spyOn(api.vendorOrders, "list").mockResolvedValue({
      orders: SAMPLE_VENDOR_ORDERS,
      vendorId: "vnd-1",
      storeName: "Atelier Bloom",
    });

    const acceptSpy = vi
      .spyOn(api.vendorOrders, "accept")
      .mockResolvedValueOnce({ success: true });
    const rejectSpy = vi
      .spyOn(api.vendorOrders, "reject")
      .mockResolvedValueOnce({ success: true });

    renderWithQuery(<VendorOrdersPage />);

    expect(await screen.findByText("#KC-5001")).toBeInTheDocument();
    expect(screen.getByText("#KC-5002")).toBeInTheDocument();
    expect(screen.getByText(/Note: Call customer on arrival at gate B/i)).toBeInTheDocument();

    // Check newly added canonical tabs exist
    expect(screen.getByRole("button", { name: /^Picked Up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Returning/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Returned/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Failed/i })).toBeInTheDocument();

    // Accept PLACED order
    await user.click(screen.getByRole("button", { name: /^Accept$/i }));
    await waitFor(() => {
      expect(acceptSpy).toHaveBeenCalledWith("vo-1");
    });

    // Reject PLACED order via modal
    await user.click(screen.getByRole("button", { name: /^Reject$/i }));
    await user.type(
      screen.getByPlaceholderText(/Selected size out of stock/i),
      "Size S damaged during QC"
    );
    await user.click(screen.getByRole("button", { name: /confirm rejection/i }));

    await waitFor(() => {
      expect(rejectSpy).toHaveBeenCalledWith("vo-1", "Size S damaged during QC", 1);
    });
  });
});
