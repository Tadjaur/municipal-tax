export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  OPERATOR: 'operator',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PERMISSIONS = {
  // Service permissions
  SERVICE_CREATE: 'service:create',
  SERVICE_UPDATE: 'service:update',
  SERVICE_DELETE: 'service:delete',
  SERVICE_VIEW: 'service:view',

  // Operator permissions
  OPERATOR_CREATE: 'operator:create',
  OPERATOR_UPDATE: 'operator:update',
  OPERATOR_APPROVE: 'operator:approve',
  OPERATOR_VIEW: 'operator:view',
  OPERATOR_ASSIGN_SERVICES: 'operator:assign_services',

  // Payment permissions
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_SEND_RECEIPT: 'payment:send_receipt',

  // Audit permissions
  AUDIT_VIEW: 'audit:view',

  // Dashboard permissions
  DASHBOARD_VIEW: 'dashboard:view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role-based permissions map
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.AGENT]: [
    PERMISSIONS.OPERATOR_CREATE,
    PERMISSIONS.OPERATOR_VIEW,
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.SERVICE_VIEW,
  ],
  [USER_ROLES.OPERATOR]: [
    PERMISSIONS.OPERATOR_VIEW,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.SERVICE_VIEW,
  ],
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const OPERATOR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type OperatorStatus = (typeof OPERATOR_STATUS)[keyof typeof OPERATOR_STATUS];

export const PAYMENT_METHODS = {
  AIRTEL_MONEY: 'airtel_money',
  MTN_MONEY: 'mtn_money',
  MOOV_MONEY: 'moov_money',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
} as const;

export type NotificationChannel =
  (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];

export const SERVICE_VALIDITY_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
} as const;

export type ServiceValidityType =
  (typeof SERVICE_VALIDITY_TYPES)[keyof typeof SERVICE_VALIDITY_TYPES];

export const SERVICE_CALCULATION_TYPES = {
  FIXED: 'fixed',
  PER_UNIT: 'perUnit',
  FORMULA: 'formula',
} as const;

export type ServiceCalculationType =
  (typeof SERVICE_CALCULATION_TYPES)[keyof typeof SERVICE_CALCULATION_TYPES];

export const CUSTOM_FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
} as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[keyof typeof CUSTOM_FIELD_TYPES];

// Currency
export const CURRENCY = 'CFA' as const;
export type Currency = typeof CURRENCY;
