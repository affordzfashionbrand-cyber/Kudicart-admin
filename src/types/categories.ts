export interface CategoryItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  status: "ACTIVE" | "INACTIVE";
  parentCategory?: string;
  displayOrder: number;
  createdAt: string;
}
