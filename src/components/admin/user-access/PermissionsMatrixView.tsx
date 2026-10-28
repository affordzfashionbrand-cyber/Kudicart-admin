"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  Check,
  CheckCircle2,
  X,
  RotateCcw,
  Save,
  Lock,
  LayoutDashboard,
  Users,
  Store,
  FolderTree,
  Package,
  ShoppingCart,
  Truck,
  ClipboardList,
  CreditCard,
  BookOpen,
  Star,
  LifeBuoy,
  ShieldCheck,
  BarChart3,
  History,
  Bell,
  Settings,
  Info,
} from "lucide-react";
import {
  PermissionActionKey,
  RolePermissionMapping,
} from "@/types/user-access";
import {
  DEMO_ADMIN_ROLES,
  PERMISSION_GROUPS,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/demo-data/user-access";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Store,
  FolderTree,
  Package,
  ShoppingCart,
  Truck,
  ClipboardList,
  CreditCard,
  BookOpen,
  Star,
  LifeBuoy,
  ShieldCheck,
  BarChart3,
  History,
  Bell,
  Settings,
};

export function PermissionsMatrixView() {
  const searchParams = useSearchParams();
  const initialRoleId = searchParams.get("role") || "role-marketplace-ops";

  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoleId);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMapping>(
    JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS))
  );
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && DEMO_ADMIN_ROLES.some((r) => r.id === roleParam)) {
      setSelectedRoleId(roleParam);
    }
  }, [searchParams]);

  const activeRole = useMemo(() => {
    return (
      DEMO_ADMIN_ROLES.find((r) => r.id === selectedRoleId) ||
      DEMO_ADMIN_ROLES[0]
    );
  }, [selectedRoleId]);

  const currentRoleMatrix = useMemo(() => {
    return rolePermissions[selectedRoleId] || {};
  }, [rolePermissions, selectedRoleId]);

  // Derive active module counts
  const enabledModuleCount = useMemo(() => {
    let count = 0;
    PERMISSION_GROUPS.forEach((group) => {
      group.modules.forEach((mod) => {
        const actions = currentRoleMatrix[mod.moduleId];
        if (actions && actions.length > 0) {
          count++;
        }
      });
    });
    return count;
  }, [currentRoleMatrix]);

  const totalModulesCount = useMemo(() => {
    return PERMISSION_GROUPS.reduce(
      (acc, group) => acc + group.modules.length,
      0
    );
  }, []);

  const handleTogglePermission = (
    moduleId: string,
    actionKey: PermissionActionKey
  ) => {
    if (activeRole.isSystemProtected) {
      setToastMessage("Super Admin template permissions are protected system defaults.");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    setRolePermissions((prev) => {
      const copy = { ...prev };
      const currentRoleObj = { ...(copy[selectedRoleId] || {}) };
      const currentActions = [...(currentRoleObj[moduleId] || [])];

      if (currentActions.includes(actionKey)) {
        currentRoleObj[moduleId] = currentActions.filter((a) => a !== actionKey);
      } else {
        currentRoleObj[moduleId] = [...currentActions, actionKey];
      }

      copy[selectedRoleId] = currentRoleObj;
      return copy;
    });

    setIsDirty(true);
  };

  const handleResetToTemplate = () => {
    setRolePermissions((prev) => ({
      ...prev,
      [selectedRoleId]: JSON.parse(
        JSON.stringify(DEFAULT_ROLE_PERMISSIONS[selectedRoleId] || {})
      ),
    }));
    setIsDirty(false);
    setToastMessage(`Reset permissions for ${activeRole.name} to template defaults.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSavePermissions = () => {
    setIsDirty(false);
    setToastMessage(
      "Permission changes are not connected in this build. Changes remain in local draft state."
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-5">
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

      {/* Role Selection Toolbar & Summary Card */}
      <section className="bg-white border border-[#E4E0DB] rounded-[10px] p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-[#111111] whitespace-nowrap">
            Selected Role:
          </label>
          <div className="relative min-w-[240px]">
            <select
              value={selectedRoleId}
              onChange={(e) => {
                setSelectedRoleId(e.target.value);
                setIsDirty(false);
              }}
              className="w-full h-[38px] pl-3 pr-8 rounded-[8px] bg-[#F7F7F5] border border-[#E4E0DB] text-xs font-semibold text-[#111111] focus:bg-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer appearance-none"
            >
              {DEMO_ADMIN_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.isSystemProtected ? "(Protected)" : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-2.5 text-[#6B6667] pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-[#EFF6FF] text-[#0043CE] border border-[#BFDBFE]">
              {enabledModuleCount} of {totalModulesCount} Modules Enabled
            </span>
            {isDirty && (
              <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                Unsaved Draft Changes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {isDirty && (
            <button
              onClick={handleResetToTemplate}
              className="h-9 px-3 border border-[#E4E0DB] hover:bg-[#F7F7F5] rounded-[8px] text-xs font-medium text-[#6B6667] hover:text-[#111111] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleSavePermissions}
            className="h-9 px-4 bg-[#FF5A1F] hover:bg-[#D94B17] text-white rounded-[8px] text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-white" />
            <span>Save Permissions</span>
          </button>
        </div>
      </section>

      {/* Role Notice Banner */}
      <div className="p-3.5 bg-[#F7F7F5] border border-[#E4E0DB] rounded-[10px] flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#6B6667] shrink-0" />
          <span className="text-[#6B6667]">
            Reviewing permissions for <strong className="text-[#111111] font-semibold">{activeRole.name}</strong>: {activeRole.description}
          </span>
        </div>
        {activeRole.isSystemProtected && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#F4F1EA] text-[#6B6667] border border-[#E4E0DB] shrink-0">
            <Lock className="w-3 h-3 text-[#6B6667]" />
            System Protected
          </span>
        )}
      </div>

      {/* Grouped Permission Matrix */}
      <div className="space-y-5">
        {PERMISSION_GROUPS.map((group) => (
          <div
            key={group.groupName}
            className="bg-white rounded-[10px] border border-[#E4E0DB] shadow-2xs overflow-hidden"
          >
            {/* Section Header */}
            <div className="px-4 py-2.5 bg-[#F9F9F7] border-b border-[#E4E0DB] flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                {group.groupName}
              </span>
              <span className="text-[11px] text-[#6B6667]">
                {group.modules.length} modules
              </span>
            </div>

            {/* Modules Rows */}
            <div className="divide-y divide-[#E4E0DB]">
              {group.modules.map((mod) => {
                const IconComponent = ICON_MAP[mod.iconName] || ShieldCheck;
                const activeActions = currentRoleMatrix[mod.moduleId] || [];
                const isModuleEnabled = activeActions.length > 0;

                return (
                  <div
                    key={mod.moduleId}
                    className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-[#F7F7F5]/40 transition-colors"
                  >
                    {/* Left: Module Details */}
                    <div className="flex items-start sm:items-center gap-3 min-w-[280px] lg:max-w-md">
                      <div
                        className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 border ${
                          isModuleEnabled
                            ? "bg-[#FFF0E8] text-[#FF5A1F] border-[#FF5A1F]/30"
                            : "bg-[#F7F7F5] text-[#6B6667] border-[#E4E0DB]"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#111111]">
                            {mod.moduleName}
                          </span>
                          {!isModuleEnabled && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#6B6667]">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B6667] mt-0.5">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Supported Permission Checkboxes */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pl-11 lg:pl-0">
                      {mod.supportedActions.map((action) => {
                        const isChecked = activeActions.includes(action.key);

                        return (
                          <label
                            key={action.key}
                            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] border text-xs cursor-pointer select-none transition-all ${
                              isChecked
                                ? "bg-[#FFF0E8] border-[#FF5A1F]/40 text-[#111111] font-medium"
                                : "bg-[#F7F7F5] border-[#E4E0DB] text-[#6B6667] hover:border-[#D0CBC4]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                handleTogglePermission(mod.moduleId, action.key)
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                                isChecked
                                  ? "bg-[#FF5A1F] border-[#FF5A1F] text-white"
                                  : "border-[#D0CBC4] bg-white"
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{action.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
