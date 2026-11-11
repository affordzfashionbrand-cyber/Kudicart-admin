import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
};

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: () => "/admin/orders",
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/lib/sentry", () => ({
  captureClientError: vi.fn(),
  initClientSentry: vi.fn(),
}));

import { api } from "@/lib/api";
import { OrderLifecyclePipeline } from "@/components/admin/dashboard/OrderLifecyclePipeline";
import AdminOrdersPage from "@/app/admin/orders/page";

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const SAMPLE_ORDERS = [
  {
    id: "ord-1",
    orderNumber: "KC-1001",
    checkoutGroupId: "grp-1",
    groupNumber: "CHK-900",
    status: "RETURNING",
    paymentMethod: "RAZORPAY",
    paymentStatus: "PAID",
    fulfillmentType: "DARK_STORE",
    itemTotal: 2500,
    deliveryFee: 50,
    taxes: 125,
    discountAmount: 0,
    grandTotal: 2675,
    isTryAndBuy: true,
    createdAt: "2026-11-11T10:00:00.000Z",
    customer: { id: "c1", name: "Ananya Verma", phone: "9876543210" },
    deliveryAddress: {
      line1: "14 Pali Hill",
      locality: "Bandra West",
      city: "Mumbai",
      pincode: "400050",
    },
    items: [
      {
        id: "oi-1",
        productId: "p1",
        title: "Silk Kurta Set",
        brand: "Affordz Official Store",
        size: "M",
        price: 2500,
        quantity: 1,
        image: "https://example.com/kurta.jpg",
      },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "KC-1002",
    checkoutGroupId: "grp-1",
    groupNumber: "CHK-900",
    status: "FAILED",
    paymentMethod: "COD",
    paymentStatus: "FAILED",
    fulfillmentType: "VENDOR",
    vendorId: "vnd-9",
    vendor: { id: "vnd-9", storeName: "Atelier Loom" },
    itemTotal: 1800,
    deliveryFee: 0,
    taxes: 90,
    discountAmount: 0,
    grandTotal: 1890,
    isTryAndBuy: false,
    createdAt: "2026-11-11T10:01:00.000Z",
    customer: { id: "c1", name: "Ananya Verma", phone: "9876543210" },
    deliveryAddress: {
      line1: "14 Pali Hill",
      locality: "Bandra West",
      city: "Mumbai",
      pincode: "400050",
    },
    items: [
      {
        id: "oi-2",
        productId: "p2",
        title: "Linen Jacket",
        brand: "Atelier Loom",
        size: "L",
        price: 1800,
        quantity: 1,
        image: "https://example.com/jacket.jpg",
      },
    ],
  },
];

describe("Admin Orders 12-State Pipeline & Split Checkout Groups", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    vi.clearAllMocks();
  });

  it("renders all 12 canonical order lifecycle stages in OrderLifecyclePipeline", () => {
    render(
      <OrderLifecyclePipeline
        pipelineCounts={{
          placed: 4,
          accepted: 3,
          preparing: 2,
          readyForPickup: 5,
          assigned: 1,
          pickedUp: 2,
          inTransit: 6,
          delivered: 20,
          returning: 3,
          returned: 7,
          cancelled: 2,
          failed: 1,
        }}
      />
    );

    const expectedLabels = [
      "Placed",
      "Accepted",
      "Preparing",
      "Ready for Pickup",
      "Assigned",
      "Picked Up",
      "Out for Delivery",
      "Delivered",
      "Returning",
      "Returned",
      "Cancelled",
      "Failed",
    ];
    for (const label of expectedLabels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders all 12 status tabs, displays split checkout group badges, and filters by status", async () => {
    const user = userEvent.setup();
    vi.spyOn(api.orders, "list").mockResolvedValue({
      data: SAMPLE_ORDERS,
      total: 2,
      page: 1,
      limit: 50,
    });

    renderWithQuery(<AdminOrdersPage />);

    expect(await screen.findByText("#KC-1001")).toBeInTheDocument();
    expect(screen.getByText("#KC-1002")).toBeInTheDocument();

    // Split checkout group chip rendered for linked sub-orders
    expect(screen.getAllByText(/CHK-900/).length).toBeGreaterThanOrEqual(2);

    // Filter to RETURNING tab
    await user.click(screen.getByRole("button", { name: /^Returning/i }));
    await waitFor(() => {
      expect(screen.getByText("#KC-1001")).toBeInTheDocument();
      expect(screen.queryByText("#KC-1002")).not.toBeInTheDocument();
    });

    // Filter to FAILED tab
    await user.click(screen.getByRole("button", { name: /^Failed/i }));
    await waitFor(() => {
      expect(screen.getByText("#KC-1002")).toBeInTheDocument();
      expect(screen.queryByText("#KC-1001")).not.toBeInTheDocument();
    });
  });
});
