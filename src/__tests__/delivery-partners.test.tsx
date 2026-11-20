import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sentry", () => ({
  captureClientError: vi.fn(),
  initClientSentry: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "drv-3dfc5998" }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

import { api } from "@/lib/api";
import AdminDeliveryPartnersPage from "@/app/admin/delivery-partners/page";
import DeliveryPartnerDeliveryHistoryPage from "@/app/admin/delivery-partners/[id]/delivery-history/page";

describe("Delivery Partner Management & Delivery History", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Delivery Partners List: displays three-dot action menu with Delivery History & KYC Details", async () => {
    const user = userEvent.setup();

    vi.spyOn(api.deliveryPartners, "list").mockResolvedValueOnce({
      data: [
        {
          id: "drv-3dfc5998",
          driverCode: "DRV-3DFC",
          fullName: "Aman Singh",
          phone: "+919344131856",
          workPreference: "FULL_TIME",
          vehicleType: "Bike",
          vehicleModel: "Hero Splendor",
          vehicleRegistration: "TN-282828282292",
          isOnline: false,
          completedDeliveries: 12,
          kycStatus: "APPROVED",
          rating: 4.8,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });

    render(<AdminDeliveryPartnersPage />);

    expect(await screen.findByText("Aman Singh")).toBeInTheDocument();
    expect(screen.getByText("DRV-3DFC")).toBeInTheDocument();

    // Verify 3-dot vertical action menu button exists instead of static View button
    const actionBtn = screen.getByLabelText("Actions for Aman Singh");
    expect(actionBtn).toBeInTheDocument();

    // Click 3-dot action button to open dropdown menu
    await user.click(actionBtn);

    // Verify the two options: Delivery History & KYC Details
    expect(await screen.findByText("Delivery History")).toBeInTheDocument();
    expect(screen.getByText("KYC Details")).toBeInTheDocument();

    // Check link destinations
    const deliveryHistoryLink = screen.getByRole("menuitem", { name: /Delivery History/i });
    expect(deliveryHistoryLink).toHaveAttribute(
      "href",
      "/admin/delivery-partners/drv-3dfc5998/delivery-history"
    );

    const kycDetailsLink = screen.getByRole("menuitem", { name: /KYC Details/i });
    expect(kycDetailsLink).toHaveAttribute(
      "href",
      "/admin/delivery-partners/drv-3dfc5998"
    );
  });

  it("Delivery History Page: renders breadcrumbs, 5 stat cards, partner details, filters & orders", async () => {
    const user = userEvent.setup();

    vi.spyOn(api.deliveryPartners, "getById").mockResolvedValueOnce({
      id: "drv-3dfc5998",
      driverCode: "DRV-3DFC",
      fullName: "Aman Singh",
      phone: "+919344131856",
      workPreference: "FULL_TIME",
      vehicleType: "Bike",
      vehicleModel: "Hero Splendor",
      vehicleRegistration: "TN-282828282292",
      isOnline: false,
      completedDeliveries: 15,
      kycStatus: "APPROVED",
      rating: 4.9,
      registeredAddress: "Chennai, TN",
      submissionDate: "2026-11-16",
      assignedReviewer: "Operations Admin",
      terminalHub: "Central Operations Hub",
      vehicleDetails: {
        vehicleType: "Bike",
        make: "Hero",
        model: "Splendor",
        registrationNumber: "TN-282828282292",
        isElectric: false,
        rcStatus: "Verified",
      },
      documents: {} as any,
      auditTrail: [],
    });

    vi.spyOn(api.deliveryPartners, "getDeliveryStats").mockResolvedValueOnce({
      totalDeliveries: 20,
      completedDeliveries: 15,
      cancelledDeliveries: 2,
      failedDeliveries: 1,
      assignedDeliveries: 2,
      successfulDeliveries: 15,
    });

    vi.spyOn(api.deliveryPartners, "getDeliveries").mockResolvedValueOnce({
      data: [
        {
          id: "order-1",
          deliveryId: "DEL-KC9910",
          orderId: "KC9910",
          orderUuid: "order-1",
          customer: { name: "John Doe", phone: "+919876543210" },
          pickupLocation: "Zara Flagship Store",
          dropLocation: "124 Indiranagar, Bengaluru",
          assignedAt: "2026-11-16T10:00:00.000Z",
          completedAt: "2026-11-16T10:35:00.000Z",
          status: "DELIVERED",
          deliveryFee: 40.0,
          earnings: 40.0,
          grandTotal: 1299.0,
          itemTotal: 1259.0,
          createdAt: "2026-11-16T10:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    render(<DeliveryPartnerDeliveryHistoryPage />);

    // Breadcrumbs & Header
    expect(await screen.findByText("Delivery Partners")).toBeInTheDocument();
    expect(screen.getAllByText("Delivery History").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Aman Singh").length).toBeGreaterThanOrEqual(1);

    // 5 Summary Stat Cards
    expect(screen.getAllByText("Total Deliveries").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("20").length).toBeGreaterThanOrEqual(1); // totalDeliveries
    expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("15").length).toBeGreaterThanOrEqual(1); // completedDeliveries
    expect(screen.getAllByText("Cancelled").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1); // cancelledDeliveries
    expect(screen.getAllByText("Failed").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1); // failedDeliveries
    expect(screen.getAllByText("Assigned / In Progress").length).toBeGreaterThanOrEqual(1);

    // Operational Partner Details Card
    expect(screen.getByText("Delivery Partner Details")).toBeInTheDocument();
    expect(screen.getByText("Hero Splendor")).toBeInTheDocument();
    expect(screen.getAllByText("TN-282828282292").length).toBeGreaterThanOrEqual(1);

    // Delivery History Table
    expect(screen.getByText("DEL-KC9910")).toBeInTheDocument();
    expect(screen.getByText("#KC9910")).toBeInTheDocument();
    expect(screen.getByText("Zara Flagship Store")).toBeInTheDocument();
    expect(screen.getByText("124 Indiranagar, Bengaluru")).toBeInTheDocument();

    // Filters tabs
    expect(screen.getByRole("button", { name: "All Deliveries" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "In Progress" })).toBeInTheDocument();
  });

  it("Delivery History Page: renders empty state when partner has 0 deliveries", async () => {
    vi.spyOn(api.deliveryPartners, "getById").mockResolvedValueOnce({
      id: "drv-118",
      driverCode: "DRV-0118",
      fullName: "Priya Sharma",
      phone: "+919123456789",
      workPreference: "PART_TIME",
      vehicleType: "Scooter",
      vehicleModel: "Activa 6G",
      vehicleRegistration: "KA-01-AB-1234",
      isOnline: true,
      completedDeliveries: 0,
      kycStatus: "APPROVED",
      rating: 5.0,
      registeredAddress: "Bengaluru, KA",
      submissionDate: "2026-11-15",
      assignedReviewer: "Operations Admin",
      terminalHub: "Kudi Harbor Hub",
      vehicleDetails: {
        vehicleType: "Scooter",
        make: "Honda",
        model: "Activa 6G",
        registrationNumber: "KA-01-AB-1234",
        isElectric: false,
        rcStatus: "Verified",
      },
      documents: {} as any,
      auditTrail: [],
    });

    vi.spyOn(api.deliveryPartners, "getDeliveryStats").mockResolvedValueOnce({
      totalDeliveries: 0,
      completedDeliveries: 0,
      cancelledDeliveries: 0,
      failedDeliveries: 0,
      assignedDeliveries: 0,
      successfulDeliveries: 0,
    });

    vi.spyOn(api.deliveryPartners, "getDeliveries").mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    render(<DeliveryPartnerDeliveryHistoryPage />);

    expect((await screen.findAllByText("Priya Sharma")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("No deliveries found")).toBeInTheDocument();
    expect(
      screen.getByText("No deliveries have been recorded for this delivery partner yet.")
    ).toBeInTheDocument();
  });

  it("Delivery History Page: renders not-found state when delivery partner profile does not exist", async () => {
    vi.spyOn(api.deliveryPartners, "getById").mockRejectedValueOnce(
      new Error("Delivery partner \"drv-invalid-999\" was not found.")
    );

    render(<DeliveryPartnerDeliveryHistoryPage />);

    expect(await screen.findByText("Delivery Partner Not Found")).toBeInTheDocument();
    expect(
      screen.getByText("Delivery partner \"drv-invalid-999\" was not found.")
    ).toBeInTheDocument();
  });
});
