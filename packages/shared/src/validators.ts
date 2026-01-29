import { z } from 'zod';
import {
  USER_ROLES,
  OPERATOR_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  NOTIFICATION_CHANNELS,
  SERVICE_VALIDITY_TYPES,
  SERVICE_CALCULATION_TYPES,
  CUSTOM_FIELD_TYPES,
} from './constants';

// User schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.AGENT, USER_ROLES.OPERATOR]),
  profile: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().regex(/^\+?[0-9]{8,15}$/),
  }),
});

// Economic Operator schemas
export const createOperatorSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().regex(/^\+?[0-9]{8,15}$/),
    email: z.string().email(),
    idCardNumber: z.string().min(1),
  }),
  businessInfo: z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    location: z.object({
      address: z.string().min(1),
      coordinates: z
        .object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        })
        .optional(),
    }),
    registrationNumber: z.string().optional(),
  }),
});

export const approveOperatorSchema = z.object({
  status: z.enum([OPERATOR_STATUS.APPROVED, OPERATOR_STATUS.REJECTED]),
});

export const assignServicesSchema = z.object({
  services: z.array(
    z.object({
      serviceId: z.string(),
      customFields: z.record(z.any()).optional(),
    })
  ),
});

// Service schemas
export const customFieldSchema = z.object({
  name: z.string().min(1),
  type: z.enum([CUSTOM_FIELD_TYPES.TEXT, CUSTOM_FIELD_TYPES.NUMBER, CUSTOM_FIELD_TYPES.SELECT]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  unit: z.string().optional(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  basePrice: z.number().min(0),
  validityPeriod: z.object({
    type: z.enum([
      SERVICE_VALIDITY_TYPES.DAILY,
      SERVICE_VALIDITY_TYPES.WEEKLY,
      SERVICE_VALIDITY_TYPES.MONTHLY,
      SERVICE_VALIDITY_TYPES.ANNUAL,
    ]),
    duration: z.number().min(1),
  }),
  calculationType: z.enum([
    SERVICE_CALCULATION_TYPES.FIXED,
    SERVICE_CALCULATION_TYPES.PER_UNIT,
    SERVICE_CALCULATION_TYPES.FORMULA,
  ]),
  calculationFormula: z.string().optional(),
  customFields: z.array(customFieldSchema),
  category: z.string().min(1),
});

export const updateServiceSchema = createServiceSchema.partial();

// Payment Request schemas
export const createPaymentRequestSchema = z.object({
  operatorId: z.string(),
  services: z.array(
    z.object({
      serviceId: z.string(),
      period: z.string(),
      customFieldValues: z.record(z.any()).optional(),
    })
  ),
  notificationChannels: z.array(
    z.enum([NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS, NOTIFICATION_CHANNELS.WHATSAPP])
  ),
});

// Payment schemas
export const initiatePaymentSchema = z.object({
  paymentRequestId: z.string(),
  paymentMethod: z.enum([
    PAYMENT_METHODS.AIRTEL_MONEY,
    PAYMENT_METHODS.MTN_MONEY,
    PAYMENT_METHODS.MOOV_MONEY,
  ]),
  phoneNumber: z.string().regex(/^\+?[0-9]{8,15}$/),
});

// Export all schemas
export const validators = {
  createUser: createUserSchema,
  createOperator: createOperatorSchema,
  approveOperator: approveOperatorSchema,
  assignServices: assignServicesSchema,
  createService: createServiceSchema,
  updateService: updateServiceSchema,
  createPaymentRequest: createPaymentRequestSchema,
  initiatePayment: initiatePaymentSchema,
};
