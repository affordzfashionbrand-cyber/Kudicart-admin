export type Role = 'ADMIN' | 'VENDOR';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  title?: string;
  vendorId?: string;
  storeName?: string;
  storeLocation?: string;
  isCertified?: boolean;
}
