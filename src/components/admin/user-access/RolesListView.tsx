"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Key,
  Search,
  Plus,
  Shield,
  X,
  CheckCircle2,
  Lock,
  ChevronRight,
  SlidersHorizontal,
  Edit2,
  Users,
} from "lucide-react";
import { AdminRoleDefinition } from "@/types/user-access";
import { DEMO_ADMIN_ROLES } from "@/demo-data/user-access";
import { EmptyState } from "@/components/ui/EmptyState";

export function RolesListView() {
  const [roles, setRoles] = useState<AdminRoleDefinition[]>(DEMO_ADMIN_ROLES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRoleDefinition | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New role state
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [roles, searchTerm]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const createdRole: AdminRoleDefinition = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || "Custom operational role template.",
      assignedUsersCount: 0,
      isSystemProtected: false,
      enabledModulesCount: 5,
      totalModulesCount: 17,
    };

    setRoles((prev) => [...prev, createdRole]);
    setIsAddOpen(false);
    setNewRoleName("");
    setNewRoleDesc("");
    setToastMessage(`Draft role "${createdRole.name}" created locally.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id
            ? { ...r, description: editDesc.trim() || r.description }
            : r
        )
      );
      setToastMessage("Role changes remain draft in this build.");
      setTimeout(() => setToastMessage(null), 3500);
    }
    setEditingRole(null);
  };

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[8px] flex items-center justify-between text-xs text-[#20885A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#20885A]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#20885A] hover:text-[#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6667]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by role name..."
            className="w-full h-[36px] pl-9 pr-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] focus:outline-none focus:border-[#FF5A1F] focus:bg-white text-[#111111] placeholder:text-[#6B6667]"
          />
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="h-9 px-3.5 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>Add Role</span>
        </button>
      </section>

      {/* Roles Table */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E0DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Administrative Role Templates
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-mono bg-[#F4F1EA] text-[#6B6667]">
              {filteredRoles.length} roles
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4">Role Name</th>
                <th className="px-4">Description</th>
                <th className="px-4 text-center">Assigned Users</th>
                <th className="px-4">Module Access</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <EmptyState
                      title="No roles found"
                      description="Try adjusting your keyword search query."
                      actionLabel="Clear Search"
                      onAction={() => setSearchTerm("")}
                    />
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr
                    key={role.id}
                    className="h-12 hover:bg-[#F7F7F5]/50 transition-colors"
                  >
                    <td className="px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#111111]">
                          {role.name}
                        </span>
                        {role.isSystemProtected && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[4px] text-[10px] font-medium bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB]">
                            <Lock className="w-2.5 h-2.5 text-[#6B6667]" />
                            Protected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 text-xs text-[#6B6667] max-w-md">
                      {role.description}
                    </td>
                    <td className="px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-[#111111] font-medium">
                        <Users className="w-3.5 h-3.5 text-[#6B6667]" />
                        {role.assignedUsersCount}
                      </span>
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#0043CE] text-[11px] font-medium border border-[#BFDBFE]">
                        {role.enabledModulesCount} of {role.totalModulesCount} Modules
                      </span>
                    </td>
                    <td className="px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setEditName(role.name);
                            setEditDesc(role.description);
                          }}
                          className="h-7 px-2.5 rounded-[6px] border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors"
                        >
                          Edit
                        </button>
                        <Link
                          href={`/admin/user-access/permissions?role=${role.id}`}
                          className="h-7 px-2.5 rounded-[6px] bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium text-[#D94B17] transition-colors inline-flex items-center gap-1"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF5A1F]" />
                          <span>Permissions</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Role Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Add Role Template
                </h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Regional Hub Supervisor"
                  className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Summarize the operational scope of this role..."
                  className="w-full p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] resize-none"
                />
              </div>

              <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] text-[11px] text-[#B45309] leading-relaxed">
                Roles created here function as local draft templates. Permissions can be customized in the <strong>Permissions</strong> tab.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E0DB]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium transition-colors"
                >
                  Create Role Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Edit Role Template
                </h3>
              </div>
              <button
                onClick={() => setEditingRole(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                  Role Name
                </label>
                <input
                  type="text"
                  value={editName}
                  disabled={editingRole.isSystemProtected}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] disabled:cursor-not-allowed select-all focus:outline-none"
                />
                {editingRole.isSystemProtected && (
                  <p className="text-[11px] text-[#6B6667] mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#6B6667]" />
                    System protected role name cannot be modified.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E0DB]">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium transition-colors"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
