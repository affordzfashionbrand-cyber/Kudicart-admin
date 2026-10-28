import { CategoryItem } from "@/types/categories";

export const DEMO_CATEGORIES: CategoryItem[] = [
  {
    id: "cat_01",
    code: "CAT-TXA",
    name: "Textiles & Apparel",
    slug: "textiles-apparel",
    description: "Handcrafted couture, embroidered shawls, kurtas, and traditional luxury textiles.",
    productCount: 48,
    status: "ACTIVE",
    displayOrder: 1,
    createdAt: "10 Jan 2024",
  },
  {
    id: "cat_02",
    code: "CAT-FTW",
    name: "Handcrafted Footwear",
    slug: "handcrafted-footwear",
    description: "Artisanal leather juttis, embellished mules, and handcrafted formal footwear.",
    productCount: 22,
    status: "ACTIVE",
    displayOrder: 2,
    createdAt: "12 Jan 2024",
  },
  {
    id: "cat_03",
    code: "CAT-JWL",
    name: "Artisanal Jewelry",
    slug: "artisanal-jewelry",
    description: "Kundan, meenakari, sterling silver, and polki statement jewelry collections.",
    productCount: 35,
    status: "ACTIVE",
    displayOrder: 3,
    createdAt: "15 Jan 2024",
  },
  {
    id: "cat_04",
    code: "CAT-LTH",
    name: "Leather Goods",
    slug: "leather-goods",
    description: "Full-grain leather totes, weekend duffels, clutches, and cardholders.",
    productCount: 19,
    status: "ACTIVE",
    displayOrder: 4,
    createdAt: "20 Jan 2024",
  },
  {
    id: "cat_05",
    code: "CAT-HML",
    name: "Home & Living",
    slug: "home-living",
    description: "Brass decor accents, hand-block printed linen, and scented soy candles.",
    productCount: 16,
    status: "ACTIVE",
    displayOrder: 5,
    createdAt: "22 Jan 2024",
  },
  {
    id: "cat_06",
    code: "CAT-FRG",
    name: "Fragrances & Attars",
    slug: "fragrances-attars",
    description: "Traditional botanical attars, artisanal oud blends, and luxury bath mists.",
    productCount: 12,
    status: "ACTIVE",
    displayOrder: 6,
    createdAt: "25 Jan 2024",
  },
  {
    id: "cat_07",
    code: "CAT-ACC",
    name: "Fashion Accessories",
    slug: "fashion-accessories",
    description: "Hand-embroidered belts, silk pocket squares, and heirloom brooches.",
    productCount: 8,
    status: "INACTIVE",
    parentCategory: "Textiles & Apparel",
    displayOrder: 7,
    createdAt: "01 Feb 2024",
  },
];

export function getDemoCategories(): CategoryItem[] {
  return DEMO_CATEGORIES;
}

export function generateCategoriesCSV(categories: CategoryItem[]): string {
  const headers = ["Category Code", "Category Name", "Slug", "Description", "Products", "Status", "Parent Category"];
  const rows = categories.map((c) => [
    `"${c.code}"`,
    `"${c.name}"`,
    `"${c.slug}"`,
    `"${c.description.replace(/"/g, '""')}"`,
    c.productCount,
    `"${c.status}"`,
    `"${c.parentCategory || "None"}"`,
  ]);
  return "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}
