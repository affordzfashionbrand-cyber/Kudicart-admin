export interface AdminAccountProfile {
  displayName: string;
  email: string;
  staffId: string;
  role: string;
  assignedTerminal: string;
  accessLevel: string;
  assignedPermissions: string;
  verified: boolean;
}

export interface WorkspacePreferences {
  defaultPageSize: number;
  currencyStandard: string;
  timestampFormat: "IST" | "UTC";
  highDensityRows: boolean;
  audioAlertExceptions: boolean;
}

export interface ActiveSessionDetails {
  gatewayIp: string;
  networkName: string;
  sessionInitiated: string;
  expiresIn: string;
  clientDevice: string;
  channelStatus: string;
}
