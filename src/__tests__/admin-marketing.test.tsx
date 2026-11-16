import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sentry", () => ({
  captureClientError: vi.fn(),
  initClientSentry: vi.fn(),
}));

import { api } from "@/lib/api";
import MarketingBannersPage from "@/app/admin/marketing/banners/page";
import MarketingOffersPage from "@/app/admin/marketing/offers/page";
import LayoutBuilderPage from "@/app/admin/marketing/layout-builder/page";

describe("Admin Marketing & CMS Studio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Banners Studio: lists banners and allows toggling status", async () => {
    const user = userEvent.setup();

    vi.spyOn(api.marketing, "getBanners").mockResolvedValueOnce([
      {
        id: "banner-1",
        placement: "HERO_CAROUSEL",
        tag: "DROP_04 • 00:28",
        title1: "Fashion,",
        title2: "now.",
        imageUrl: "https://res.cloudinary.com/test/banner1.jpg",
        targetGender: "Women",
        actionType: "CATEGORY",
        actionValue: "Western",
        displayOrder: 1,
        isActive: true,
      },
    ]);

    const updateSpy = vi.spyOn(api.marketing, "updateBanner").mockResolvedValueOnce({
      id: "banner-1",
      placement: "HERO_CAROUSEL",
      title1: "Fashion,",
      imageUrl: "https://res.cloudinary.com/test/banner1.jpg",
      targetGender: "Women",
      actionType: "CATEGORY",
      displayOrder: 1,
      isActive: false,
    });

    render(<MarketingBannersPage />);

    expect(await screen.findByText("Marketing Banners Studio")).toBeInTheDocument();
    expect(await screen.findByText("DROP_04 • 00:28")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    const activeBtn = screen.getByText("Active");
    await user.click(activeBtn);

    expect(updateSpy).toHaveBeenCalledWith("banner-1", { isActive: false });
  });

  it("Bank Offers Manager: renders partner offers with codes and discount details", async () => {
    vi.spyOn(api.marketing, "getBankOffers").mockResolvedValueOnce([
      {
        id: "bo-axis",
        bankName: "AXIS BANK",
        badgeBgColor: "#861F41",
        title: "10% INSTANT DISCOUNT*",
        subtitle: "On Axis Bank Credit Cards",
        code: "AXIS10",
        discountText: "10% OFF up to ₹1,000",
        minSpendText: "₹2,499",
        details: "Terms and conditions apply.",
        displayOrder: 1,
        isActive: true,
      },
    ]);

    render(<MarketingOffersPage />);

    expect(await screen.findByText("Partner Bank Offers Manager")).toBeInTheDocument();
    expect(await screen.findByText("AXIS BANK")).toBeInTheDocument();
    expect((await screen.findAllByText("AXIS10")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("10% OFF up to ₹1,000")).toBeInTheDocument();
  });

  it("Layout Builder: renders vertical section ordering and controls", async () => {
    vi.spyOn(api.marketing, "getSections").mockResolvedValueOnce([
      {
        id: "sec-1",
        sectionKey: "HERO_BANNER",
        displayName: "Hero Banners Carousel",
        title: "Fashion, now.",
        subtitle: "Curated Drops",
        displayOrder: 1,
        isEnabled: true,
        items: [],
      },
      {
        id: "sec-2",
        sectionKey: "BANK_OFFERS",
        displayName: "Partner Bank Offers Ticker",
        title: "Bank Discounts",
        subtitle: "Instant Savings",
        displayOrder: 2,
        isEnabled: true,
        items: [],
      },
    ]);

    render(<LayoutBuilderPage />);

    expect(await screen.findByText("Homepage Layout Builder")).toBeInTheDocument();
    expect(await screen.findByText("Hero Banners Carousel")).toBeInTheDocument();
    expect(await screen.findByText("Partner Bank Offers Ticker")).toBeInTheDocument();
    expect(screen.getAllByText("Enabled")).toHaveLength(2);
  });
});
