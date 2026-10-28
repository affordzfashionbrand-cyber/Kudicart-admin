"use client";

import React, { useState, useMemo } from "react";
import { CategoryItem } from "@/types/categories";
import { getDemoCategories, generateCategoriesCSV } from "@/demo-data/categories";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(getDemoCategories());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal / Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    slug: "",
    description: "",
    parentCategory: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(q);
        const matchesCode = cat.code.toLowerCase().includes(q);
        const matchesDesc = cat.description.toLowerCase().includes(q);
        const matchesSlug = cat.slug.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc && !matchesSlug) return false;
      }
      if (statusFilter !== "ALL" && cat.status !== statusFilter) return false;
      return true;
    });
  }, [categories, searchTerm, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      code: "",
      slug: "",
      description: "",
      parentCategory: "",
      status: "ACTIVE",
    });
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      code: category.code,
      slug: category.slug,
      description: category.description,
      parentCategory: category.parentCategory || "",
      status: category.status,
    });
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Category name is required.";
    if (!formData.code.trim()) errors.code = "Category code is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsDrawerOpen(false);
    showToast("Not connected in this build. Category persistence requires backend connectivity.");
  };

  const handleExportCSV = () => {
    if (!filteredCategories.length) return;
    const csvContent = generateCategoriesCSV(filteredCategories);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `kudicart_categories_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto box-border min-w-0 px-4 sm:px-5 lg:px-6 pt-3.5 sm:pt-4 pb-8 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-3 rounded-[8px] shadow-lg flex items-center gap-3 border border-[#333333] text-xs">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#6B6667] hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E0DB]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
              Categories
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB] text-xs font-medium tabular-nums">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-[#6B6667] mt-0.5">
            Manage marketplace departments, category hierarchies, and merchandise taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-[8px] bg-white border border-[#E4E0DB] text-[#111111] hover:bg-[#F7F7F5] transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#6B6667]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-9 px-3.5 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6B6667] text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category name, code..."
              className="w-full h-9 pl-9 pr-3 bg-[#F7F7F5] text-xs text-[#111111] placeholder:text-[#6B6667]/60 rounded-[8px] border border-[#E4E0DB] focus:bg-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all font-normal"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-[#F7F7F5] text-xs text-[#111111] rounded-[8px] border border-[#E4E0DB] appearance-none focus:outline-none focus:border-[#FF5A1F] cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {(searchTerm || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 px-2.5 rounded-[8px] text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA] transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="text-right text-[#6B6667] text-xs">
          Showing <span className="font-semibold text-[#111111]">{filteredCategories.length}</span> of {categories.length} categories
        </div>
      </div>

      {/* Categories Data Table */}
      <div className="bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4 sm:px-5 py-0 font-medium">Code</th>
                <th className="px-4 py-0 font-medium">Category Name</th>
                <th className="px-4 py-0 font-medium">Slug</th>
                <th className="px-4 py-0 font-medium">Parent Category</th>
                <th className="px-4 py-0 font-medium text-right">Products</th>
                <th className="px-4 py-0 font-medium text-center">Status</th>
                <th className="px-4 sm:px-5 py-0 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-[13px] text-[#111111]">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#6B6667]">
                    <p className="font-medium text-[#111111]">No categories found</p>
                    <p className="text-xs text-[#6B6667] mt-1">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="h-12 hover:bg-[#F7F7F5]/50 transition-colors">
                    <td className="px-4 sm:px-5 py-0 font-mono text-xs font-medium text-[#111111] whitespace-nowrap">
                      {cat.code}
                    </td>
                    <td className="px-4 py-0">
                      <div>
                        <span className="font-medium text-[#111111]">{cat.name}</span>
                        <p className="text-xs text-[#6B6667] line-clamp-1 max-w-sm mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-0 font-mono text-xs text-[#6B6667] whitespace-nowrap">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-0 text-xs text-[#6B6667] whitespace-nowrap">
                      {cat.parentCategory || "—"}
                    </td>
                    <td className="px-4 py-0 font-semibold text-[#111111] text-right tabular-nums whitespace-nowrap">
                      {cat.productCount}
                    </td>
                    <td className="px-4 py-0 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          cat.status === "ACTIVE"
                            ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]"
                            : "bg-[#F7F7F5] text-[#6B6667] border-[#E4E0DB]"
                        }`}
                      >
                        {cat.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-0 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] hover:bg-[#FFF0E8] px-2 py-1 rounded transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] h-full bg-white border-l border-[#E4E0DB] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Header */}
            <div className="h-16 px-5 border-b border-[#E4E0DB] flex items-center justify-between shrink-0">
              <h2 className="text-[17px] font-semibold text-[#111111]">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-[6px] text-[#6B6667] hover:text-[#111111] hover:bg-[#F4F1EA]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Form */}
            <form onSubmit={handleSaveCategory} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Category Name <span className="text-[#DA1E28]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Textiles & Apparel"
                  className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                />
                {formErrors.name && (
                  <p className="text-[11px] text-[#DA1E28] mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Category Code <span className="text-[#DA1E28]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CAT-TXA"
                  className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                />
                {formErrors.code && (
                  <p className="text-[11px] text-[#DA1E28] mt-1">{formErrors.code}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. textiles-apparel"
                  className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                  className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category merchandising details..."
                  className="w-full p-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })
                  }
                  className="w-full h-9 px-3 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#E4E0DB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-3.5 py-2 rounded-[8px] border border-[#E4E0DB] bg-white text-xs font-medium text-[#111111] hover:bg-[#F7F7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium transition-colors"
                >
                  {editingCategory ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
