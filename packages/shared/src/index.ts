// ─── User Roles ───────────────────────────────────────────────
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

// ─── Permissions ──────────────────────────────────────────────
export enum Permission {
  // Contacts
  CONTACTS_VIEW = 'contacts:view',
  CONTACTS_CREATE = 'contacts:create',
  CONTACTS_UPDATE = 'contacts:update',
  CONTACTS_DELETE = 'contacts:delete',
  // Deals
  DEALS_VIEW = 'deals:view',
  DEALS_CREATE = 'deals:create',
  DEALS_UPDATE = 'deals:update',
  DEALS_DELETE = 'deals:delete',
  // Communication
  CALLING_USE = 'calling:use',
  EMAIL_SEND = 'email:send',
  SMS_SEND = 'sms:send',
  WHATSAPP_SEND = 'whatsapp:send',
  CHAT_USE = 'chat:use',
  // Marketing
  CAMPAIGNS_VIEW = 'campaigns:view',
  CAMPAIGNS_CREATE = 'campaigns:create',
  CAMPAIGNS_MANAGE = 'campaigns:manage',
  // Social Boost
  SOCIAL_BOOST_VIEW = 'social_boost:view',
  SOCIAL_BOOST_CREATE = 'social_boost:create',
  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  // Staff Management
  STAFF_VIEW = 'staff:view',
  STAFF_MANAGE = 'staff:manage',
  // Payments
  PAYMENTS_VIEW = 'payments:view',
  INVOICES_CREATE = 'invoices:create',
}

// ─── Subscription Plans ───────────────────────────────────────
export enum PlanTier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE',
}

// ─── Social Platforms ─────────────────────────────────────────
export enum SocialPlatform {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  TIKTOK = 'TIKTOK',
  MARKETPLACE = 'MARKETPLACE',
}

// ─── Payment Gateways ─────────────────────────────────────────
export enum PaymentGateway {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  RAZORPAY = 'RAZORPAY',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  SSLCOMMERZ = 'SSLCOMMERZ',
  ROCKET = 'ROCKET',
  AAMARPAY = 'AAMARPAY',
}

// ─── Communication Types ──────────────────────────────────────
export enum CommunicationType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  CHAT = 'CHAT',
}

// ─── Deal Stages ──────────────────────────────────────────────
export enum DealStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
}

// ─── Campaign Types ───────────────────────────────────────────
export enum CampaignType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  MULTI_CHANNEL = 'MULTI_CHANNEL',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

// ─── Boost Status ─────────────────────────────────────────────
export enum BoostStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// ─── Common Response Types ────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── JWT Payload ──────────────────────────────────────────────
export interface JwtPayload {
  sub: string;         // user id
  email: string;
  role: UserRole;
  tenantId: string;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

// ─── RabbitMQ Events ──────────────────────────────────────────
export enum MessagePattern {
  // Auth events
  AUTH_VALIDATE_TOKEN = 'auth.validate_token',
  AUTH_USER_CREATED = 'auth.user_created',
  // Tenant events
  TENANT_CREATED = 'tenant.created',
  TENANT_SUSPENDED = 'tenant.suspended',
  // CRM events
  CONTACT_CREATED = 'crm.contact_created',
  DEAL_WON = 'crm.deal_won',
  // Communication events
  SEND_EMAIL = 'comm.send_email',
  SEND_SMS = 'comm.send_sms',
  SEND_WHATSAPP = 'comm.send_whatsapp',
  // Notification events
  NOTIFY_USER = 'notify.user',
}
