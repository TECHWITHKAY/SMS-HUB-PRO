export enum UserRole {
  SUPER_ADMIN = "Super Admin",
  ADMIN = "Admin",
  STAFF = "Staff",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  permissions: string[];
  active: boolean;
}

export interface SMSProvider {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  senderId?: string;
  token?: string;
  customHeaders?: string; // JSON string
  active: boolean;
  isDefault: boolean;
}

export interface SenderID {
  id: string;
  name: string;
  isDefault: boolean;
  status: "Active" | "Pending" | "Inactive";
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  tags: string[];
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  contactIds: string[];
  createdAt: string;
}

export interface SMSMessage {
  id: string;
  recipient: string;
  recipientName?: string;
  message: string;
  status: "Delivered" | "Failed" | "Pending";
  cost: number;
  dateSent: string;
  providerUsed: string;
  senderId: string;
  campaignName?: string;
}

export interface ScheduledSMS {
  id: string;
  recipientType: "single" | "bulk" | "group";
  recipient: string; // Phone, group name, or "Bulk Campaign"
  message: string;
  scheduleTime: string;
  frequency: "once" | "daily" | "weekly" | "monthly" | "birthday";
  status: "Scheduled" | "Sent" | "Cancelled";
  createdAt: string;
}

export interface SMSTemplate {
  id: string;
  title: string;
  content: string;
  category: "Welcome" | "Birthday" | "Reminder" | "Marketing" | "General";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface BlacklistedNumber {
  id: string;
  phoneNumber: string;
  reason: string;
  createdAt: string;
}
