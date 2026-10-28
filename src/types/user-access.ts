export type AdminAccountStatus = "ACTIVE" | "INACTIVE";

export type AdminRoleType =
  | "Super Admin"
  | "Marketplace Operations"
  | "Catalog Manager"
  | "Finance Reviewer"
  | "Support Manager";

export interface AdminUserAccount {
  id: string;
  name: string;
  email: string;
  role: AdminRoleType;
  status: AdminAccountStatus;
  lastActive: string;
  department: string;
  avatarInitials: string;
  assignedTerminal: string;
}

export interface AdminRoleDefinition {
  id: string;
  name: AdminRoleType | string;
  description: string;
  assignedUsersCount: number;
  isSystemProtected: boolean;
  enabledModulesCount: number;
  totalModulesCount: number;
}

export type PermissionActionKey =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export"
  | "assign"
  | "moderate";

export interface PermissionActionCapability {
  key: PermissionActionKey;
  label: string;
}

export interface ModulePermissionSpec {
  moduleId: string;
  moduleName: string;
  description: string;
  iconName: string;
  supportedActions: PermissionActionCapability[];
}

export interface PermissionGroupSpec {
  groupName: "Core" | "Logistics & Fulfillment" | "Finance & Governance" | "System Control";
  modules: ModulePermissionSpec[];
}

export type RolePermissionMapping = Record<string, Record<string, PermissionActionKey[]>>;
