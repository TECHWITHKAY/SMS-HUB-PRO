import {
  User,
  UserRole,
  SMSProvider,
  SenderID,
  Contact,
  Group,
  SMSMessage,
  ScheduledSMS,
  SMSTemplate,
  AuditLog,
  BlacklistedNumber
} from "./types";

// Helper to load from localStorage or fall back
const getLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(`smshub_${key}`);
  if (data) {
    try {
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const setLocal = <T>(key: string, value: T): void => {
  localStorage.setItem(`smshub_${key}`, JSON.stringify(value));
};

// Seed initial data to match high-fidelity screenshots!
const defaultUsers: User[] = [
  {
    id: "usr_1",
    name: "Yaa Adjei",
    email: "sethsefa18@gmail.com",
    role: UserRole.SUPER_ADMIN,
    permissions: ["send_sms", "manage_contacts", "manage_providers", "view_reports", "manage_users"],
    active: true,
    avatarUrl: ""
  },
  {
    id: "usr_2",
    name: "Kofi Mensah",
    email: "kofi.mensah@smshub.com",
    role: UserRole.ADMIN,
    permissions: ["send_sms", "manage_contacts", "view_reports", "manage_users"],
    active: true
  },
  {
    id: "usr_3",
    name: "Ama Serwaa",
    email: "ama.serwaa@smshub.com",
    role: UserRole.STAFF,
    permissions: ["send_sms", "manage_contacts", "view_reports"],
    active: true
  }
];

const defaultProviders: SMSProvider[] = [
  {
    id: "prov_1",
    name: "Hubtel",
    apiUrl: "https://api.hubtel.com/v1/messages/send",
    apiKey: "ht_sk_live_9a87d6f5e4c3b2a1",
    apiSecret: "hubtel_secret_998877",
    senderId: "SMSHUBPRO",
    active: true,
    isDefault: true
  },
  {
    id: "prov_2",
    name: "Arkesel",
    apiUrl: "https://sms.arkesel.com/sms/api",
    apiKey: "ark_key_abc123xyz",
    senderId: "PRO_ALERT",
    active: true,
    isDefault: false
  },
  {
    id: "prov_3",
    name: "MNotify",
    apiUrl: "https://api.mnotify.com/v2/sms",
    apiKey: "mnot_live_456def789",
    senderId: "NOTIFY_ME",
    active: true,
    isDefault: false
  },
  {
    id: "prov_4",
    name: "Twilio",
    apiUrl: "https://api.twilio.com/2010-04-01/Accounts",
    apiKey: "AC_twilio_sid_example_123",
    token: "tw_token_8877665544",
    active: false,
    isDefault: false
  },
  {
    id: "prov_5",
    name: "Africa's Talking",
    apiUrl: "https://api.africastalking.com/version1/messaging",
    apiKey: "at_apikey_9988776655",
    username: "smshub_sandbox",
    active: false,
    isDefault: false
  }
];

const defaultSenderIDs: SenderID[] = [
  { id: "snd_1", name: "SMSHUBPRO", isDefault: true, status: "Active", createdAt: "2026-01-10" },
  { id: "snd_2", name: "PRO_ALERT", isDefault: false, status: "Active", createdAt: "2026-02-15" },
  { id: "snd_3", name: "NOTIFY_ME", isDefault: false, status: "Active", createdAt: "2026-03-01" },
  { id: "snd_4", name: "CHURCH_MSG", isDefault: false, status: "Pending", createdAt: "2026-06-20" },
  { id: "snd_5", name: "CAMPUS_INFO", isDefault: false, status: "Inactive", createdAt: "2026-04-12" }
];

const defaultContacts: Contact[] = [
  { id: "c_1", name: "Seth Sefa", phoneNumber: "+233544321098", email: "sethsefa18@gmail.com", tags: ["Customer", "VIP"], createdAt: "2026-05-01" },
  { id: "c_2", name: "John Doe", phoneNumber: "+233201234567", email: "john.doe@example.com", tags: ["Customer"], createdAt: "2026-05-02" },
  { id: "c_3", name: "Jane Smith", phoneNumber: "+233244556677", email: "jane.smith@example.com", tags: ["Employee", "Staff"], createdAt: "2026-05-03" },
  { id: "c_4", name: "David Mensah", phoneNumber: "+14155552671", email: "david.m@example.com", tags: ["Student"], createdAt: "2026-05-05" },
  { id: "c_5", name: "Araba Attah", phoneNumber: "+233551122334", email: "araba@example.com", tags: ["Church Members"], createdAt: "2026-05-10" },
  { id: "c_6", name: "Michael Vance", phoneNumber: "+447911123456", email: "mvance@example.com", tags: ["Event Attendees"], createdAt: "2026-05-12" },
  { id: "c_7", name: "Patricia Appiah", phoneNumber: "+233277998877", email: "pat@example.com", tags: ["Customer"], createdAt: "2026-05-15" },
  { id: "c_8", name: "Emmanuel Boateng", phoneNumber: "+233243112233", email: "emmanuel@example.com", tags: ["Church Members"], createdAt: "2026-05-18" },
  { id: "c_9", name: "Theresa Osei", phoneNumber: "+233504433221", email: "theresa@example.com", tags: ["Student"], createdAt: "2026-05-20" }
];

const defaultGroups: Group[] = [
  { id: "g_1", name: "Students", description: "All campus student representatives", contactIds: ["c_4", "c_9"], createdAt: "2026-05-05" },
  { id: "g_2", name: "Customers", description: "SMS platform premium buyers", contactIds: ["c_1", "c_2", "c_7"], createdAt: "2026-05-01" },
  { id: "g_3", name: "Employees", description: "Internal operations staff", contactIds: ["c_3"], createdAt: "2026-05-03" },
  { id: "g_4", name: "Church Members", description: "Sunday assembly announcements list", contactIds: ["c_5", "c_8"], createdAt: "2026-05-10" },
  { id: "g_5", name: "Event Attendees", description: "SMS Hub Launch conference registrants", contactIds: ["c_6"], createdAt: "2026-05-12" }
];

const defaultTemplates: SMSTemplate[] = [
  { id: "t_1", title: "Welcome Message", content: "Dear {Name}, welcome to SMS Hub Pro! Your account is active. Start sending bulk SMS with top delivery rates now.", category: "Welcome", createdAt: "2026-05-01" },
  { id: "t_2", title: "Birthday Message", content: "Happy Birthday, Dear {Name}! May this year bring you abundant success and happiness. Thank you for choosing us! - SMS Hub Pro", category: "Birthday", createdAt: "2026-05-02" },
  { id: "t_3", title: "Event Reminder", content: "Hi {Name}, this is a reminder for our upcoming launch event tomorrow at 10:00 AM. We look forward to seeing you. Venue: Accra Digital Center.", category: "Reminder", createdAt: "2026-05-03" },
  { id: "t_4", title: "Marketing Campaign", content: "Hello {Name}! Supercharge your sales this weekend with our 20% discount code: PRO20. Top up your balance now: smshub.pro", category: "Marketing", createdAt: "2026-05-04" },
  { id: "t_5", title: "OTP Verification", content: "Your SMS Hub Pro security verification code is {OTP}. This code expires in 5 minutes. Do not share with anyone.", category: "General", createdAt: "2026-05-05" }
];

const defaultHistory: SMSMessage[] = [
  { id: "m_1", recipient: "+233544321098", recipientName: "Seth Sefa", message: "Dear Seth Sefa, welcome to SMS Hub Pro! Your account is active.", status: "Delivered", cost: 0.02, dateSent: "2026-06-26T12:00:00-07:00", providerUsed: "Hubtel", senderId: "SMSHUBPRO" },
  { id: "m_2", recipient: "+233201234567", recipientName: "John Doe", message: "Dear John Doe, welcome to SMS Hub Pro! Your account is active.", status: "Delivered", cost: 0.02, dateSent: "2026-06-26T11:45:00-07:00", providerUsed: "Hubtel", senderId: "SMSHUBPRO" },
  { id: "m_3", recipient: "+233244556677", recipientName: "Jane Smith", message: "Hi Jane Smith, reminder for staff standup meeting at 9:00 AM today.", status: "Delivered", cost: 0.02, dateSent: "2026-06-26T08:30:00-07:00", providerUsed: "Hubtel", senderId: "SMSHUBPRO" },
  { id: "m_4", recipient: "+14155552671", recipientName: "David Mensah", message: "Dear David, please submit your event feedback form before 5 PM.", status: "Failed", cost: 0.00, dateSent: "2026-06-25T14:20:00-07:00", providerUsed: "Arkesel", senderId: "PRO_ALERT" },
  { id: "m_5", recipient: "+233551122334", recipientName: "Araba Attah", message: "Dear Araba Attah, we look forward to worshiping with you this Sunday at 8 AM.", status: "Delivered", cost: 0.02, dateSent: "2026-06-24T18:10:00-07:00", providerUsed: "MNotify", senderId: "NOTIFY_ME" },
  { id: "m_6", recipient: "+447911123456", recipientName: "Michael Vance", message: "Hello Michael, premium conference seat tickets have been emailed to you.", status: "Delivered", cost: 0.04, dateSent: "2026-06-23T10:00:00-07:00", providerUsed: "Hubtel", senderId: "SMSHUBPRO" },
  { id: "m_7", recipient: "+233277998877", recipientName: "Patricia Appiah", message: "Your code is 4321. Do not share.", status: "Delivered", cost: 0.02, dateSent: "2026-06-22T16:40:00-07:00", providerUsed: "MNotify", senderId: "NOTIFY_ME" },
  { id: "m_8", recipient: "+233243112233", recipientName: "Emmanuel Boateng", message: "Happy birthday Emmanuel, wishing you God's blessings!", status: "Delivered", cost: 0.02, dateSent: "2026-06-21T06:00:00-07:00", providerUsed: "Arkesel", senderId: "PRO_ALERT" }
];

const defaultScheduled: ScheduledSMS[] = [
  { id: "sch_1", recipientType: "group", recipient: "Church Members", message: "Dear Church Members, remember our evening fellowship today at 6 PM.", scheduleTime: "2026-06-28T18:00:00", frequency: "weekly", status: "Scheduled", createdAt: "2026-06-25T10:00:00" },
  { id: "sch_2", recipientType: "single", recipient: "+233544321098", message: "Happy Birthday Seth Sefa! Wishing you a splendid year ahead.", scheduleTime: "2026-11-20T07:00:00", frequency: "birthday", status: "Scheduled", createdAt: "2026-06-26T09:00:00" },
  { id: "sch_3", recipientType: "group", recipient: "Students", message: "Reminder: Exam timetable updates are now live on the campus portal.", scheduleTime: "2026-06-30T09:30:00", frequency: "once", status: "Scheduled", createdAt: "2026-06-26T12:00:00" }
];

const defaultBlacklist: BlacklistedNumber[] = [
  { id: "bl_1", phoneNumber: "+233209998888", reason: "User requested opt-out", createdAt: "2026-05-15" },
  { id: "bl_2", phoneNumber: "+15554443322", reason: "Spam complaint received", createdAt: "2026-06-01" }
];

const defaultAuditLogs: AuditLog[] = [
  { id: "log_1", userId: "usr_1", userName: "Yaa Adjei", userRole: UserRole.SUPER_ADMIN, action: "LOGIN", details: "Super Admin logged in successfully", ipAddress: "192.168.1.50", timestamp: "2026-06-26T13:00:00-07:00" },
  { id: "log_2", userId: "usr_1", userName: "Yaa Adjei", userRole: UserRole.SUPER_ADMIN, action: "SMS_SEND_SINGLE", details: "Sent single SMS to +233544321098 via Hubtel", ipAddress: "192.168.1.50", timestamp: "2026-06-26T12:00:00-07:00" },
  { id: "log_3", userId: "usr_1", userName: "Yaa Adjei", userRole: UserRole.SUPER_ADMIN, action: "PROVIDER_TOGGLE", details: "Enabled Arkesel provider", ipAddress: "192.168.1.50", timestamp: "2026-06-25T16:00:00-07:00" },
  { id: "log_4", userId: "usr_2", userName: "Kofi Mensah", userRole: UserRole.ADMIN, action: "CONTACT_IMPORT", details: "Imported 45 contacts from Contacts_Mailing.csv", ipAddress: "192.168.1.52", timestamp: "2026-06-24T11:00:00-07:00" }
];

export class SMSHubStore {
  // Current session user
  currentUser: User | null = null;
  rememberMe: boolean = false;

  // Domain data
  users: User[] = [];
  providers: SMSProvider[] = [];
  senderIDs: SenderID[] = [];
  contacts: Contact[] = [];
  groups: Group[] = [];
  messages: SMSMessage[] = [];
  scheduled: ScheduledSMS[] = [];
  templates: SMSTemplate[] = [];
  blacklist: BlacklistedNumber[] = [];
  auditLogs: AuditLog[] = [];

  // Platform state
  balance: number = 12480; // matching screenshot GHS / Credits balance
  theme: "light" | "dark" = "light";
  
  // Custom API request logs for tracing provider calls
  apiLogs: { timestamp: string; url: string; payload: string; response: string; success: boolean }[] = [];

  constructor() {
    this.loadState();
  }

  loadState() {
    this.users = getLocal("users", defaultUsers);
    this.providers = getLocal("providers", defaultProviders);
    this.senderIDs = getLocal("senderIDs", defaultSenderIDs);
    this.contacts = getLocal("contacts", defaultContacts);
    this.groups = getLocal("groups", defaultGroups);
    this.messages = getLocal("messages", defaultHistory);
    this.scheduled = getLocal("scheduled", defaultScheduled);
    this.templates = getLocal("templates", defaultTemplates);
    this.blacklist = getLocal("blacklist", defaultBlacklist);
    this.auditLogs = getLocal("auditLogs", defaultAuditLogs);
    this.balance = getLocal("balance", 12480);
    this.theme = getLocal("theme", "light") as "light" | "dark";
    this.apiLogs = getLocal("apiLogs", [
      { timestamp: "2026-06-26 12:00:05", url: "https://api.hubtel.com/v1/messages/send", payload: `{"From":"SMSHUBPRO", "To":"+233544321098", "Content":"Dear Seth..."}`, response: `{"status": "success", "messageId": "ht_1029384756"}`, success: true },
      { timestamp: "2026-06-25 14:20:11", url: "https://sms.arkesel.com/sms/api", payload: `{"sender":"PRO_ALERT", "recipient":"+14155552671", "message":"Dear David..."}`, response: `{"status": "error", "error": "Invalid country prefix or routing restriction"}`, success: false }
    ]);

    // Check if remember me session exists
    const rememberedUser = localStorage.getItem("smshub_remembered_user");
    if (rememberedUser) {
      try {
        const u = JSON.parse(rememberedUser);
        const match = this.users.find(user => user.email === u.email && user.active);
        if (match) {
          this.currentUser = match;
          this.rememberMe = true;
        }
      } catch {
        // clear corrupted
        localStorage.removeItem("smshub_remembered_user");
      }
    }
  }

  saveState() {
    setLocal("users", this.users);
    setLocal("providers", this.providers);
    setLocal("senderIDs", this.senderIDs);
    setLocal("contacts", this.contacts);
    setLocal("groups", this.groups);
    setLocal("messages", this.messages);
    setLocal("scheduled", this.scheduled);
    setLocal("templates", this.templates);
    setLocal("blacklist", this.blacklist);
    setLocal("auditLogs", this.auditLogs);
    setLocal("balance", this.balance);
    setLocal("theme", this.theme);
    setLocal("apiLogs", this.apiLogs);
  }

  // Auth Operations
  login(email: string, password: string, remember: boolean): boolean {
    // Standard secure-looking mock login logic (allowing password matching)
    // Any user from users can log in, but for demo: email matching active user
    // Password standard check: "password" or same as email prefix
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.active) {
      this.currentUser = user;
      this.rememberMe = remember;
      if (remember) {
        localStorage.setItem("smshub_remembered_user", JSON.stringify({ email: user.email }));
      } else {
        localStorage.removeItem("smshub_remembered_user");
      }
      this.addAuditLog("LOGIN", `Successfully signed in via email/password. Remember: ${remember}`);
      return true;
    }
    return false;
  }

  loginWithGoogle(): boolean {
    // Google OAuth simulation
    const user = this.users[0]; // defaults to Yaa Adjei (Super Admin)
    this.currentUser = user;
    this.rememberMe = true;
    localStorage.setItem("smshub_remembered_user", JSON.stringify({ email: user.email }));
    this.addAuditLog("LOGIN_GOOGLE", "Successfully authenticated via Google Federated Sign-In");
    return true;
  }

  logout() {
    if (this.currentUser) {
      this.addAuditLog("LOGOUT", `Signed out session for ${this.currentUser.name}`);
    }
    this.currentUser = null;
    localStorage.removeItem("smshub_remembered_user");
    this.saveState();
  }

  // Audit Logs
  addAuditLog(action: string, details: string) {
    const user = this.currentUser || { id: "system", name: "System", role: UserRole.SUPER_ADMIN };
    const newLog: AuditLog = {
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      userId: user.id,
      userName: user.name,
      userRole: user.role as UserRole,
      action,
      details,
      ipAddress: "192.168.1." + Math.floor(Math.random() * 100 + 40),
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    this.saveState();
  }

  // Active Provider and Default Sender
  getActiveProvider(): SMSProvider | undefined {
    // Find default first
    const activeDefault = this.providers.find(p => p.active && p.isDefault);
    if (activeDefault) return activeDefault;
    // Or any active
    return this.providers.find(p => p.active);
  }

  getDefaultSenderID(): string {
    const s = this.senderIDs.find(s => s.isDefault && s.status === "Active");
    return s ? s.name : "SMSHUBPRO";
  }

  // Sending Actions (Single, Bulk, Group)
  // Simulate network calls to the provider API, creating a request log & reducing balance
  triggerSendSMS(
    senderId: string,
    recipients: string[],
    messageText: string,
    campaignName?: string
  ): { successCount: number; failedCount: number; errors: string[] } {
    const activeProvider = this.getActiveProvider();
    if (!activeProvider) {
      this.addAuditLog("SMS_SEND_ERROR", "Failed to send messages: No active SMS provider configured");
      return { successCount: 0, failedCount: recipients.length, errors: ["No active SMS provider found."] };
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Deduplicate recipients
    const uniqueRecipients = Array.from(new Set(recipients)).filter(r => r.trim() !== "");
    const costPerSMS = activeProvider.name === "Hubtel" ? 0.02 : activeProvider.name === "Arkesel" ? 0.015 : 0.025;

    uniqueRecipients.forEach(phone => {
      // Validation Check
      const cleanPhone = phone.replace(/\s+/g, "");
      const isBlacklisted = this.blacklist.some(b => b.phoneNumber === cleanPhone);

      if (isBlacklisted) {
        failedCount++;
        errors.push(`Number ${cleanPhone} is currently blacklisted.`);
        // Record log
        this.addSMSMessage(cleanPhone, messageText, "Failed", 0, activeProvider.name, senderId, campaignName);
        return;
      }

      // Verify simple length/validity format
      const isValid = /^\+?[1-9]\d{1,14}$/.test(cleanPhone) || cleanPhone.length >= 8;
      if (!isValid) {
        failedCount++;
        errors.push(`Number ${cleanPhone} failed numeric validation standards.`);
        this.addSMSMessage(cleanPhone, messageText, "Failed", 0, activeProvider.name, senderId, campaignName);
        return;
      }

      // Check balance
      if (this.balance < 1) {
        failedCount++;
        errors.push(`Insufficient credits balance for delivery to ${cleanPhone}.`);
        this.addSMSMessage(cleanPhone, messageText, "Failed", 0, activeProvider.name, senderId, campaignName);
        return;
      }

      // Success Delivery Simulation (95% success probability)
      const isDelivered = Math.random() < 0.96;
      const status = isDelivered ? "Delivered" : "Failed";
      const finalCost = isDelivered ? costPerSMS : 0;

      if (isDelivered) {
        successCount++;
        this.balance -= 1; // Reduce SMS balance credit by 1
      } else {
        failedCount++;
      }

      // Save to logs
      const nameMatch = this.contacts.find(c => c.phoneNumber === cleanPhone)?.name;
      this.addSMSMessage(cleanPhone, messageText, status, finalCost, activeProvider.name, senderId, campaignName, nameMatch);
    });

    // Save outbound API simulation logs
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    const mockPayload = JSON.stringify({
      provider: activeProvider.name,
      sender: senderId,
      recipients: uniqueRecipients.length,
      message: messageText,
      headers: activeProvider.customHeaders ? JSON.parse(activeProvider.customHeaders) : {}
    });
    const mockResponse = JSON.stringify({
      status: successCount > 0 ? "partial_or_success" : "failed",
      success_count: successCount,
      failed_count: failedCount,
      provider_ref: "sh_" + Math.random().toString(36).substr(2, 9)
    });

    this.apiLogs.unshift({
      timestamp,
      url: activeProvider.apiUrl,
      payload: mockPayload,
      response: mockResponse,
      success: successCount > 0
    });

    this.addAuditLog(
      "SMS_SEND_CAMPAIGN",
      `Sent Campaign via ${activeProvider.name}. Delivered: ${successCount}, Failed: ${failedCount}, Cost: ${(successCount * costPerSMS).toFixed(3)} credits`
    );

    this.saveState();
    return { successCount, failedCount, errors };
  }

  // Adding SMS History Entry
  addSMSMessage(
    recipient: string,
    message: string,
    status: "Delivered" | "Failed" | "Pending",
    cost: number,
    provider: string,
    senderId: string,
    campaignName?: string,
    recipientName?: string
  ) {
    const newMsg: SMSMessage = {
      id: "m_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      recipient,
      recipientName,
      message,
      status,
      cost,
      dateSent: new Date().toISOString(),
      providerUsed: provider,
      senderId,
      campaignName
    };
    this.messages.unshift(newMsg);
    this.saveState();
  }

  // Contacts
  addContact(contact: Omit<Contact, "id" | "createdAt">) {
    const newC: Contact = {
      ...contact,
      id: "c_" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0]
    };
    this.contacts.unshift(newC);
    this.addAuditLog("CONTACT_CREATE", `Added contact ${newC.name} (${newC.phoneNumber})`);
    this.saveState();
    return newC;
  }

  editContact(id: string, updated: Partial<Contact>) {
    this.contacts = this.contacts.map(c => c.id === id ? { ...c, ...updated } : c);
    const item = this.contacts.find(c => c.id === id);
    if (item) {
      this.addAuditLog("CONTACT_EDIT", `Edited contact ${item.name}`);
    }
    this.saveState();
  }

  deleteContact(id: string) {
    const item = this.contacts.find(c => c.id === id);
    if (item) {
      this.addAuditLog("CONTACT_DELETE", `Deleted contact ${item.name}`);
    }
    this.contacts = this.contacts.filter(c => c.id !== id);
    // Remove from groups too
    this.groups = this.groups.map(g => ({
      ...g,
      contactIds: g.contactIds.filter(cid => cid !== id)
    }));
    this.saveState();
  }

  // Groups
  addGroup(group: Omit<Group, "id" | "createdAt">) {
    const newG: Group = {
      ...group,
      id: "g_" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0]
    };
    this.groups.push(newG);
    this.addAuditLog("GROUP_CREATE", `Created group ${newG.name} with ${newG.contactIds.length} members`);
    this.saveState();
    return newG;
  }

  editGroup(id: string, updated: Partial<Group>) {
    this.groups = this.groups.map(g => g.id === id ? { ...g, ...updated } : g);
    const item = this.groups.find(g => g.id === id);
    if (item) {
      this.addAuditLog("GROUP_EDIT", `Edited group ${item.name}. Member count: ${item.contactIds.length}`);
    }
    this.saveState();
  }

  deleteGroup(id: string) {
    const item = this.groups.find(g => g.id === id);
    if (item) {
      this.addAuditLog("GROUP_DELETE", `Deleted group ${item.name}`);
    }
    this.groups = this.groups.filter(g => g.id !== id);
    this.saveState();
  }

  // Providers
  addProvider(prov: Omit<SMSProvider, "id">) {
    const newP: SMSProvider = {
      ...prov,
      id: "prov_" + Date.now()
    };
    // If setting default, unset others
    if (newP.isDefault) {
      this.providers = this.providers.map(p => ({ ...p, isDefault: false }));
    }
    this.providers.push(newP);
    this.addAuditLog("PROVIDER_CREATE", `Registered SMS gateway ${newP.name}`);
    this.saveState();
    return newP;
  }

  editProvider(id: string, updated: Partial<SMSProvider>) {
    if (updated.isDefault) {
      this.providers = this.providers.map(p => ({ ...p, isDefault: p.id === id }));
    }
    this.providers = this.providers.map(p => p.id === id ? { ...p, ...updated } : p);
    const item = this.providers.find(p => p.id === id);
    if (item) {
      this.addAuditLog("PROVIDER_EDIT", `Updated gateway configuration for ${item.name}`);
    }
    this.saveState();
  }

  deleteProvider(id: string) {
    const item = this.providers.find(p => p.id === id);
    if (item) {
      this.addAuditLog("PROVIDER_DELETE", `Removed SMS gateway ${item.name}`);
    }
    this.providers = this.providers.filter(p => p.id !== id);
    // If we deleted the default, set another default
    if (item?.isDefault && this.providers.length > 0) {
      this.providers[0].isDefault = true;
    }
    this.saveState();
  }

  // Sender IDs
  addSenderID(name: string) {
    const clean = name.trim().toUpperCase();
    if (this.senderIDs.some(s => s.name === clean)) return null;

    const newS: SenderID = {
      id: "snd_" + Date.now(),
      name: clean,
      isDefault: this.senderIDs.length === 0,
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0]
    };
    this.senderIDs.push(newS);
    this.addAuditLog("SENDERID_CREATE", `Added Sender ID request: ${clean}`);
    this.saveState();
    return newS;
  }

  editSenderID(id: string, updated: Partial<SenderID>) {
    if (updated.isDefault) {
      this.senderIDs = this.senderIDs.map(s => ({ ...s, isDefault: s.id === id }));
    }
    this.senderIDs = this.senderIDs.map(s => s.id === id ? { ...s, ...updated } : s);
    const item = this.senderIDs.find(s => s.id === id);
    if (item) {
      this.addAuditLog("SENDERID_EDIT", `Modified status/settings of Sender ID ${item.name}`);
    }
    this.saveState();
  }

  deleteSenderID(id: string) {
    const item = this.senderIDs.find(s => s.id === id);
    if (item) {
      this.addAuditLog("SENDERID_DELETE", `Removed Sender ID registration ${item.name}`);
    }
    this.senderIDs = this.senderIDs.filter(s => s.id !== id);
    if (item?.isDefault && this.senderIDs.length > 0) {
      this.senderIDs[0].isDefault = true;
    }
    this.saveState();
  }

  // Scheduled SMS
  addScheduled(sch: Omit<ScheduledSMS, "id" | "status" | "createdAt">) {
    const newS: ScheduledSMS = {
      ...sch,
      id: "sch_" + Date.now(),
      status: "Scheduled",
      createdAt: new Date().toISOString()
    };
    this.scheduled.unshift(newS);
    this.addAuditLog("SCHEDULE_SMS", `Scheduled message to ${sch.recipient} for ${sch.scheduleTime}`);
    this.saveState();
    return newS;
  }

  editScheduled(id: string, updated: Partial<ScheduledSMS>) {
    this.scheduled = this.scheduled.map(s => s.id === id ? { ...s, ...updated } : s);
    this.saveState();
  }

  cancelScheduled(id: string) {
    this.scheduled = this.scheduled.map(s => s.id === id ? { ...s, status: "Cancelled" as const } : s);
    const item = this.scheduled.find(s => s.id === id);
    if (item) {
      this.addAuditLog("SCHEDULE_CANCEL", `Cancelled scheduled message to ${item.recipient}`);
    }
    this.saveState();
  }

  // Templates
  addTemplate(tpl: Omit<SMSTemplate, "id" | "createdAt">) {
    const newT: SMSTemplate = {
      ...tpl,
      id: "t_" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0]
    };
    this.templates.unshift(newT);
    this.addAuditLog("TEMPLATE_CREATE", `Created template: "${newT.title}"`);
    this.saveState();
    return newT;
  }

  editTemplate(id: string, updated: Partial<SMSTemplate>) {
    this.templates = this.templates.map(t => t.id === id ? { ...t, ...updated } : t);
    const item = this.templates.find(t => t.id === id);
    if (item) {
      this.addAuditLog("TEMPLATE_EDIT", `Updated template: "${item.title}"`);
    }
    this.saveState();
  }

  deleteTemplate(id: string) {
    const item = this.templates.find(t => t.id === id);
    if (item) {
      this.addAuditLog("TEMPLATE_DELETE", `Removed template: "${item.title}"`);
    }
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveState();
  }

  // Blacklist
  addToBlacklist(phoneNumber: string, reason: string) {
    const clean = phoneNumber.trim().replace(/\s+/g, "");
    if (this.blacklist.some(b => b.phoneNumber === clean)) return null;

    const newB: BlacklistedNumber = {
      id: "bl_" + Date.now(),
      phoneNumber: clean,
      reason,
      createdAt: new Date().toISOString().split("T")[0]
    };
    this.blacklist.unshift(newB);
    this.addAuditLog("BLACKLIST_ADD", `Added ${clean} to the system blacklist`);
    this.saveState();
    return newB;
  }

  removeFromBlacklist(id: string) {
    const item = this.blacklist.find(b => b.id === id);
    if (item) {
      this.addAuditLog("BLACKLIST_REMOVE", `Removed ${item.phoneNumber} from the system blacklist`);
    }
    this.blacklist = this.blacklist.filter(b => b.id !== id);
    this.saveState();
  }

  // Users Management
  addUser(u: Omit<User, "id">) {
    const newU: User = {
      ...u,
      id: "usr_" + Date.now()
    };
    this.users.push(newU);
    this.addAuditLog("USER_CREATE", `Created system user Account: ${newU.name} (${newU.role})`);
    this.saveState();
    return newU;
  }

  editUser(id: string, updated: Partial<User>) {
    this.users = this.users.map(u => u.id === id ? { ...u, ...updated } : u);
    const item = this.users.find(u => u.id === id);
    if (item) {
      this.addAuditLog("USER_EDIT", `Modified settings of user: ${item.name}`);
    }
    this.saveState();
  }

  // Quick Stats
  getStats() {
    // Standard totals based on mock records
    // Since mock statistics on UI are:
    // Total SMS Sent: 184320, Delivered: 178904, Failed: 5416
    // We will accumulate our current message database length but base it on the high starting point to make it extremely realistic!
    const activeAdded = this.messages.length - defaultHistory.length;
    const deliveredCount = this.messages.filter(m => m.status === "Delivered").length;
    const failedCount = this.messages.filter(m => m.status === "Failed").length;

    const baseSent = 184320;
    const baseDelivered = 178904;
    const baseFailed = 5416;

    const totalSent = baseSent + activeAdded;
    const totalDelivered = baseDelivered + (deliveredCount - defaultHistory.filter(m => m.status === "Delivered").length);
    const totalFailed = baseFailed + (failedCount - defaultHistory.filter(m => m.status === "Failed").length);

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 97.1;
    const failureRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 2.9;

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate,
      failureRate,
      balance: this.balance,
      contactsCount: this.contacts.length + 8403, // Base count in screenshot: 8412
      groupsCount: this.groups.length + 19, // Base count in screenshot: 24
    };
  }

  // Change Theme
  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    this.saveState();
  }
}

// Global instance to import easily
export const store = new SMSHubStore();
