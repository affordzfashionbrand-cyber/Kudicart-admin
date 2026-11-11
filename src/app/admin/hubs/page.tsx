"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Warehouse,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  CreateDarkStoreHubInput,
  DarkStoreHub,
  UpdateDarkStoreHubInput,
} from "@/types/products";

interface HubFormState {
  name: string;
  locality: string;
  address: string;
  lat: string;
  lng: string;
  deliveryMinutes: string;
  isActive: boolean;
}

function defaultHubForm(): HubFormState {
  return {
    name: "",
    locality: "",
    address: "",
    lat: "",
    lng: "",
    deliveryMinutes: "30",
    isActive: true,
  };
}

export default function AdminHubsPage() {
  const [hubs, setHubs] = useState<DarkStoreHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<DarkStoreHub | null>(null);
  const [formState, setFormState] = useState<HubFormState>(defaultHubForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadHubs = useCallback(
    async (withInactive: boolean, showRefreshToast = false) => {
      setLoading(true);
      setApiError(null);
      try {
        const res = await api.hubs.list(withInactive);
        const rows = Array.isArray(res?.data) ? res.data : [];
        setHubs(rows);
        if (showRefreshToast) {
          showToast("Dark Store hubs refreshed.");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load dark store hubs from backend.";
        setHubs([]);
        setApiError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadHubs(includeInactive, false);
  }, [includeInactive, loadHubs]);

  const filteredHubs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return hubs.filter((hub) => {
      if (!includeInactive && hub.isActive === false) {
        return false;
      }
      if (!q) return true;
      return (
        hub.name.toLowerCase().includes(q) ||
        String(hub.locality || "").toLowerCase().includes(q) ||
        String(hub.address || "").toLowerCase().includes(q)
      );
    });
  }, [hubs, includeInactive, searchTerm]);

  const openCreateModal = () => {
    setEditingHub(null);
    setFormState(defaultHubForm());
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (hub: DarkStoreHub) => {
    setEditingHub(hub);
    setFormState({
      name: hub.name || "",
      locality: hub.locality || "",
      address: hub.address || "",
      lat: hub.lat !== undefined ? String(hub.lat) : "",
      lng: hub.lng !== undefined ? String(hub.lng) : "",
      deliveryMinutes:
        hub.deliveryMinutes !== undefined
          ? String(hub.deliveryMinutes)
          : hub.slaMinutes !== undefined
            ? String(hub.slaMinutes)
            : "30",
      isActive: hub.isActive !== false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = formState.name.trim();
    const locality = formState.locality.trim();
    const address = formState.address.trim();
    if (!name || !locality || !address) {
      setFormError("Hub name, locality, and full address are required.");
      return;
    }

    const lat = Number(formState.lat);
    const lng = Number(formState.lng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setFormError("Latitude must be between -90 and 90.");
      return;
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      setFormError("Longitude must be between -180 and 180.");
      return;
    }

    const deliveryMinutes = formState.deliveryMinutes.trim()
      ? Math.floor(Number(formState.deliveryMinutes))
      : 30;
    if (!Number.isFinite(deliveryMinutes) || deliveryMinutes < 1) {
      setFormError("Preparation SLA minutes must be at least 1.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingHub) {
        const payload: UpdateDarkStoreHubInput = {
          name,
          locality,
          address,
          lat,
          lng,
          deliveryMinutes,
          isActive: formState.isActive,
        };
        const res = await api.hubs.update(editingHub.id, payload);
        const updated = res?.data;
        if (updated) {
          setHubs((prev) =>
            prev.map((h) => (h.id === editingHub.id ? updated : h))
          );
        } else {
          await loadHubs(includeInactive, false);
        }
        showToast(res?.message || `Updated hub ${name}.`, "success");
      } else {
        const payload: CreateDarkStoreHubInput = {
          name,
          locality,
          address,
          lat,
          lng,
          deliveryMinutes,
          isActive: formState.isActive,
        };
        const res = await api.hubs.create(payload);
        const created = res?.data;
        if (created) {
          setHubs((prev) => [created, ...prev]);
        } else {
          await loadHubs(includeInactive, false);
        }
        showToast(res?.message || `Created dark store hub ${name}.`, "success");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save dark store hub."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (hub: DarkStoreHub) => {
    setBusyId(hub.id);
    const nextActive = hub.isActive === false;
    try {
      const res = await api.hubs.update(hub.id, { isActive: nextActive });
      const updated = res?.data;
      if (updated) {
        setHubs((prev) => prev.map((h) => (h.id === hub.id ? updated : h)));
      } else {
        setHubs((prev) =>
          prev.map((h) => (h.id === hub.id ? { ...h, isActive: nextActive } : h))
        );
      }
      showToast(
        `${hub.name} marked ${nextActive ? "active" : "inactive"}.`,
        "success"
      );
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to update hub status.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (hub: DarkStoreHub) => {
    setBusyId(hub.id);
    try {
      const res = await api.hubs.delete(hub.id);
      if (res?.data && res.data.id) {
        // Backend soft-deactivates hubs linked to catalog products
        setHubs((prev) =>
          prev.map((h) => (h.id === hub.id ? (res.data as DarkStoreHub) : h))
        );
      } else {
        setHubs((prev) => prev.filter((h) => h.id !== hub.id));
      }
      showToast(res?.message || `Hub ${hub.name} removed.`, "success");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to remove dark store hub.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {toast && (
        <div
          role="status"
          className={`fixed top-20 right-8 z-50 p-4 rounded-[8px] shadow-lg border flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#20885A]"
              : "bg-[#FEF2F2] border-[#FECACA] text-[#DA1E28]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span className="text-xs font-medium">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">
            Dark Store Hubs
          </h1>
          <p className="text-[13px] text-[#6B6667] mt-1">
            Manage Affordz Official Store dark store staging hubs and pickup addresses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => void loadHubs(includeInactive, true)}
            disabled={loading}
            className="h-9 px-3.5 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs font-medium hover:bg-[#F7F7F5] transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FF5A1F]" : "text-[#6B6667]"}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="h-9 px-4 rounded-[8px] bg-[#FF5A1F] hover:bg-[#D94B17] text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dark Store Hub</span>
          </button>
        </div>
      </section>

      {apiError && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DA1E28] rounded-[10px] px-4 py-3 text-xs flex items-center justify-between gap-3">
          <span>{apiError}</span>
          <button
            type="button"
            onClick={() => void loadHubs(includeInactive, false)}
            className="px-3 py-1 rounded-[6px] bg-white border border-[#FECACA] text-[#DA1E28] font-medium hover:bg-[#FFF5F5]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <section className="bg-white p-3 rounded-[10px] border border-[#E4E0DB] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#6B6667] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hubs by name, locality, or address..."
            className="w-full h-9 pl-9 pr-3 rounded-[8px] border border-[#E4E0DB] bg-white text-[#111111] text-xs focus:border-[#FF5A1F] outline-none placeholder:text-[#6B6667]"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-[#111111] cursor-pointer">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="accent-[#FF5A1F]"
          />
          <span>Include inactive hubs</span>
        </label>
      </section>

      {/* Hubs Table */}
      <section className="bg-white rounded-[10px] border border-[#E4E0DB] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-[#6B6667] text-xs font-medium">
                <th className="py-2 pl-4 pr-3 font-medium">Hub</th>
                <th className="py-2 px-3 font-medium">Locality &amp; Address</th>
                <th className="py-2 px-3 font-medium">Coordinates</th>
                <th className="py-2 px-3 font-medium">Dispatch SLA</th>
                <th className="py-2 px-3 font-medium">Status</th>
                <th className="py-2 pr-4 pl-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B6667]">
                    Loading dark store hubs...
                  </td>
                </tr>
              ) : filteredHubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10">
                    <EmptyState
                      title="No dark store hubs configured"
                      description="Register an Affordz Dark Store staging hub to assign inventory and pickup dispatch."
                      actionLabel="Add Dark Store Hub"
                      onAction={openCreateModal}
                    />
                  </td>
                </tr>
              ) : (
                filteredHubs.map((hub) => {
                  const isActive = hub.isActive !== false;
                  const isBusy = busyId === hub.id;
                  return (
                    <tr key={hub.id} className="h-14 hover:bg-[#F7F7F5]/60">
                      <td className="py-2.5 pl-4 pr-3">
                        <div className="flex items-center gap-2 font-medium text-[#111111]">
                          <Warehouse className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0" />
                          <span>{hub.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#6B6667] mt-0.5">
                          {hub.id}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 max-w-[280px]">
                        <div className="font-medium text-[#111111]">
                          {hub.locality || "—"}
                        </div>
                        <div className="text-[11px] text-[#6B6667] truncate">
                          {hub.address || "—"}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#6B6667]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF5A1F]" />
                          {hub.lat !== undefined && hub.lng !== undefined
                            ? `${Number(hub.lat).toFixed(4)}, ${Number(hub.lng).toFixed(4)}`
                            : "—"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#111111]">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-[#6B6667]" />
                          {hub.deliveryMinutes ?? hub.slaMinutes ?? 30} min
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium border ${
                            isActive
                              ? "bg-[#ECFDF5] text-[#20885A] border-[#A7F3D0]"
                              : "bg-[#F4F1EA] text-[#6B6667] border-[#E4E0DB]"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 pl-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleToggleActive(hub)}
                            className="h-7 px-2.5 rounded-[6px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] disabled:opacity-50"
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openEditModal(hub)}
                            aria-label={`Edit ${hub.name}`}
                            className="h-7 px-2 rounded-[6px] border border-[#E4E0DB] bg-white hover:bg-[#F7F7F5] text-[#6B6667] hover:text-[#111111] disabled:opacity-50"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleDelete(hub)}
                            aria-label={`Delete ${hub.name}`}
                            className="h-7 px-2 rounded-[6px] border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B91C1C] disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[12px] max-w-lg w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <h2 className="text-[15px] font-semibold text-[#111111]">
                {editingHub ? `Edit ${editingHub.name}` : "Add Dark Store Hub"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DA1E28]">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label htmlFor="hub-name" className="block font-medium text-[#111111] mb-1">
                  Hub Name
                </label>
                <input
                  id="hub-name"
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Bandra Dark Store 01"
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div>
                <label htmlFor="hub-locality" className="block font-medium text-[#111111] mb-1">
                  Locality
                </label>
                <input
                  id="hub-locality"
                  type="text"
                  required
                  value={formState.locality}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, locality: e.target.value }))
                  }
                  placeholder="e.g., Bandra West"
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="hub-address" className="block font-medium text-[#111111] mb-1">
                  Street Address
                </label>
                <input
                  id="hub-address"
                  type="text"
                  required
                  value={formState.address}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Full warehouse street address"
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div>
                <label htmlFor="hub-lat" className="block font-medium text-[#111111] mb-1">
                  Latitude
                </label>
                <input
                  id="hub-lat"
                  type="number"
                  step="any"
                  required
                  value={formState.lat}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, lat: e.target.value }))
                  }
                  placeholder="19.0596"
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div>
                <label htmlFor="hub-lng" className="block font-medium text-[#111111] mb-1">
                  Longitude
                </label>
                <input
                  id="hub-lng"
                  type="number"
                  step="any"
                  required
                  value={formState.lng}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, lng: e.target.value }))
                  }
                  placeholder="72.8295"
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div>
                <label htmlFor="hub-sla" className="block font-medium text-[#111111] mb-1">
                  Dispatch SLA (Minutes)
                </label>
                <input
                  id="hub-sla"
                  type="number"
                  min={1}
                  step={1}
                  value={formState.deliveryMinutes}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      deliveryMinutes: e.target.value,
                    }))
                  }
                  className="w-full h-9 px-3 rounded-[8px] border border-[#E4E0DB] bg-[#F7F7F5] font-mono focus:bg-white focus:border-[#FF5A1F] outline-none"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#111111]">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="accent-[#FF5A1F]"
                  />
                  <span>Active hub</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E0DB]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingHub
                    ? "Save Changes"
                    : "Save Hub"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
