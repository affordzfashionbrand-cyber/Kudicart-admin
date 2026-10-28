"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  UserPlus,
  X,
  CheckCircle2,
  ChevronDown,
  Shield,
  Eye,
  Edit2,
  Lock,
  Building2,
  Clock,
  Mail,
  User,
} from "lucide-react";
import { AdminUserAccount, AdminRoleType } from "@/types/user-access";
import { DEMO_ADMIN_USERS, DEMO_ADMIN_ROLES } from "@/demo-data/user-access";
import { EmptyState } from "@/components/ui/EmptyState";

export function UsersListView() {
  const [users, setUsers] = useState<AdminUserAccount[]>(DEMO_ADMIN_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<AdminUserAccount | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState<AdminUserAccount | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<AdminRoleType>("Marketplace Operations");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRoleType>("Marketplace Operations");
  const [newDepartment, setNewDepartment] = useState("Fulfillment & Dispatch");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }

      if (roleFilter !== "ALL" && u.role !== roleFilter) {
        return false;
      }

      if (statusFilter !== "ALL" && u.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddOpen(false);
    setNewName("");
    setNewEmail("");
    setToastMessage("Not connected in this build: Administrative account invitations require backend IAM services.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRoleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editRoleUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editRoleUser.id ? { ...u, role: selectedNewRole } : u
        )
      );
      setToastMessage(`Not connected in this build: Role assignment requires backend authorization.`);
      setTimeout(() => setToastMessage(null), 3500);
    }
    setEditRoleUser(null);
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

      {/* Filter Toolbar & Actions */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Keyword Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6667]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-[36px] pl-9 pr-3 text-xs bg-[#F7F7F5] border border-[#E4E0DB] rounded-[8px] focus:outline-none focus:border-[#FF5A1F] focus:bg-white text-[#111111] placeholder:text-[#6B6667]"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-xs bg-white border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:outline-none focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              {DEMO_ADMIN_ROLES.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6667] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[36px] pl-3 pr-8 text-xs bg-white border border-[#E4E0DB] rounded-[8px] text-[#111111] focus:outline-none focus:border-[#FF5A1F] appearance-none cursor-pointer"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6667] pointer-events-none" />
          </div>

          {(searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="h-[36px] px-3 text-xs text-[#6B6667] hover:text-[#111111] hover:bg-[#F7F7F5] rounded-[8px] flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="h-9 px-3.5 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5 text-white" />
          <span>Add Admin User</span>
        </button>
      </section>

      {/* Users Table */}
      <div className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E0DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-[#111111]">
              Administrative Accounts
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-mono bg-[#F4F1EA] text-[#6B6667]">
              {filteredUsers.length} of {users.length} accounts
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
                <th className="px-4">Account User</th>
                <th className="px-4">Email Address</th>
                <th className="px-4">Assigned Role</th>
                <th className="px-4 text-center">Status</th>
                <th className="px-4">Last Active</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0DB] text-xs text-[#111111]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <EmptyState
                      title="No administrative accounts found"
                      description="Try resetting your keyword search or active role filters."
                      actionLabel="Clear Filters"
                      onAction={clearFilters}
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors"
                  >
                    <td className="px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#F4F1EA] text-[#111111] flex items-center justify-center font-semibold text-[11px] shrink-0 border border-[#E4E0DB]">
                          {user.avatarInitials}
                        </div>
                        <div>
                          <div className="font-medium text-[#111111]">{user.name}</div>
                          <div className="text-[11px] text-[#6B6667]">{user.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 font-mono text-xs text-[#111111] whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#EFF6FF] text-[#0043CE] border border-[#BFDBFE]">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 text-center whitespace-nowrap">
                      {user.status === "ACTIVE" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#ECFDF5] text-[#20885A] border border-[#A7F3D0]">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#F7F7F5] text-[#6B6667] border border-[#E4E0DB]">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 text-[#6B6667] whitespace-nowrap">
                      {user.lastActive}
                    </td>
                    <td className="px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditRoleUser(user);
                            setSelectedNewRole(user.role);
                          }}
                          className="h-7 px-2.5 rounded-[6px] border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors"
                        >
                          Edit Role
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="h-7 px-2.5 rounded-[6px] bg-white border border-[#E4E0DB] hover:bg-[#F7F7F5] text-xs font-medium text-[#111111] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#6B6667]" />
                          <span>Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1A1C1B] text-white flex items-center justify-center font-semibold text-sm">
                  {selectedUser.avatarInitials}
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111111]">
                    {selectedUser.name}
                  </h3>
                  <span className="text-[11px] font-mono text-[#6B6667]">{selectedUser.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6667]">Email:</span>
                  <span className="font-mono text-[#111111] font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6667]">Role:</span>
                  <span className="font-medium text-[#111111]">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6667]">Department:</span>
                  <span className="text-[#111111]">{selectedUser.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6667]">Terminal:</span>
                  <span className="text-[#111111]">{selectedUser.assignedTerminal}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#E4E0DB]">
                  <span className="text-[#6B6667]">Account Status:</span>
                  <span className={`font-semibold ${selectedUser.status === "ACTIVE" ? "text-[#20885A]" : "text-[#6B6667]"}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#B45309]">
                Role definitions and module permissions for this account are governed by the assigned <strong>{selectedUser.role}</strong> template.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E0DB]">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editRoleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Change Account Role
                </h3>
              </div>
              <button
                onClick={() => setEditRoleUser(null)}
                className="text-[#6B6667] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoleUpdate} className="space-y-4">
              <div className="text-xs text-[#6B6667]">
                Select the role template to assign to <strong className="text-[#111111]">{editRoleUser.name}</strong> ({editRoleUser.email}):
              </div>

              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                  Assigned Role Template
                </label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value as AdminRoleType)}
                  className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
                >
                  {DEMO_ADMIN_ROLES.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E0DB]">
                <button
                  type="button"
                  onClick={() => setEditRoleUser(null)}
                  className="px-4 py-2 border border-[#E4E0DB] rounded-[8px] text-xs font-medium text-[#6B6667] hover:bg-[#F7F7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium transition-colors"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4E0DB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0DB]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-[15px] font-semibold text-[#111111]">
                  Add Administrative User
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
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Babatunde Adeyemi"
                  className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. b.adeyemi@kudicart.com"
                  className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                    Role Template
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AdminRoleType)}
                    className="w-full h-[38px] px-2.5 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
                  >
                    {DEMO_ADMIN_ROLES.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#6B6667] font-medium mb-1 uppercase tracking-wider">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full h-[38px] px-2.5 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] text-[11px] text-[#B45309] leading-relaxed">
                Demonstration modal: In this frontend-only build, new administrative account creation is not persisted to IAM identity directories.
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
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
