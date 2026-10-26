import {
  AdminAccountProfile,
  WorkspacePreferences,
  ActiveSessionDetails,
} from "@/types/settings";

export const MOCK_ADMIN_PROFILE: AdminAccountProfile = {
  displayName: "Amara Okonkwo",
  email: "amara.okonkwo@kudicart.internal",
  staffId: "#USR-101",
  role: "Chief Operations Lead",
  assignedTerminal: "Central Ops HQ / Bandra West Node",
  accessLevel: "SuperAdmin Node",
  assignedPermissions: "ALL_DOMAINS_ROOT",
  verified: true,
};

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  defaultPageSize: 10,
  currencyStandard: "Indian Rupee (INR ₹) — Comma Separated",
  timestampFormat: "IST",
  highDensityRows: true,
  audioAlertExceptions: false,
};

export const MOCK_ACTIVE_SESSION: ActiveSessionDetails = {
  gatewayIp: "192.168.1.42",
  networkName: "Internal Gateway VPN",
  sessionInitiated: "24 Oct 2024, 08:15 IST",
  expiresIn: "5h 42m",
  clientDevice: "macOS Sonoma • Chrome 129.0",
  channelStatus: "Current Session",
};
