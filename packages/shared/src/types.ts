import type {
  UserRole,
  Permission,
  PaymentStatus,
  OperatorStatus,
  PaymentMethod,
  NotificationChannel,
  ServiceValidityType,
  ServiceCalculationType,
  CustomFieldType,
  Currency,
} from './constants';

// Firestore Timestamp type (will be actual Timestamp in functions, Date in frontend)
export type Timestamp = Date | FirebaseFirestore.Timestamp;

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// User types
export interface User {
  uid: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  municipalityId: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Economic Operator types
export interface EconomicOperator {
  id: string;
  userId: string;
  status: OperatorStatus;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    idCardUrl: string;
    idCardNumber: string;
  };
  businessInfo: {
    name: string;
    type: string;
    location: {
      address: string;
      coordinates?: GeoPoint;
    };
    photos: string[];
    registrationNumber?: string;
  };
  assignedServices: AssignedService[];
  createdAt: Timestamp;
  approvedAt?: Timestamp;
  approvedBy?: string;
}

export interface AssignedService {
  serviceId: string;
  assignedAt: Timestamp;
  assignedBy: string;
  customFields: Record<string, any>;
}

// Service types
export interface CustomField {
  name: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[];
  unit?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: Currency;
  validityPeriod: {
    type: ServiceValidityType;
    duration: number;
  };
  calculationType: ServiceCalculationType;
  calculationFormula?: string;
  customFields: CustomField[];
  category: string;
  isActive: boolean;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

// Payment Request types
export interface PaymentRequestService {
  serviceId: string;
  serviceName: string;
  amount: number;
  period: string;
  customFieldValues: Record<string, any>;
}

export interface PaymentRequest {
  id: string;
  operatorId: string;
  requestNumber: string;
  services: PaymentRequestService[];
  totalAmount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentToken?: string;
  paymentDate?: Timestamp;
  notificationChannels: NotificationChannel[];
  notifiedAt?: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
  paidAt?: Timestamp;
}

// Payment types
export interface Payment {
  id: string;
  paymentRequestId: string;
  operatorId: string;
  operatorName: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: 'mypayga';
  providerData: {
    paymentToken: string;
    orderId: string;
    transactionId?: string;
    message?: string;
  };
  receiptUrl?: string;
  receiptSentAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Audit Log types
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  changes: {
    before?: any;
    after?: any;
  };
  ip?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

// Dashboard types
export interface DashboardStats {
  dailyRevenue: number;
  transactionCount: number;
  taxDistribution: {
    category: string;
    percentage: number;
    amount: number;
  }[];
  channelDistribution: {
    channel: PaymentMethod;
    percentage: number;
    amount: number;
  }[];
  revenueByPeriod: {
    period: string;
    amount: number;
  }[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// MyPayga types
export interface MyPaygaCallbackData {
  hash: string;
  order_status: string;
  unique_id: string;
  amount: string;
  payment_token: string;
  payment_method: string;
  message: string;
  status_request: number;
  currency: string;
  client_phone?: string;
}

export interface MyPaygaPaymentInitRequest {
  amount: number;
  currency: string;
  description: string;
  success_url: string;
  error_url: string;
  callback_url: string;
  client_email?: string;
  client_phone?: string;
  unique_id: string;
}
