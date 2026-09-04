export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  organizationId: string;
  organizationName: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
}
