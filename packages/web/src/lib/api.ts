import { createFetchClient } from 'up-fetch';
import { z } from 'zod';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/municipal-tax/us-central1/api';

// Create up-fetch client with automatic auth token injection
export const apiClient = createFetchClient({
  baseUrl: API_URL,
  async beforeRequest(request) {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    request.headers.set('Content-Type', 'application/json');
    return request;
  },
  async onRequestError(error) {
    console.error('Request error:', error);
    throw error;
  },
  async onResponseError(response) {
    if (response.status === 401) {
      // Handle unauthorized - maybe redirect to login
      console.error('Unauthorized request');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  },
});

// API response wrapper schema
const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

// Service schemas (from shared)
import type { Service, Payment, EconomicOperator } from 'shared';

// Export typed API functions
export const api = {
  // Services
  services: {
    list: () =>
      apiClient
        .get('/api/services')
        .validate(apiResponseSchema(z.array(z.any())))
        .then(res => res.data as Service[]),
    
    get: (id: string) =>
      apiClient
        .get(`/api/services/${id}`)
        .validate(apiResponseSchema(z.any()))
        .then(res => res.data as Service),
    
    create: (data: Partial<Service>) =>
      apiClient
        .post('/api/services', { body: data })
        .validate(apiResponseSchema(z.any()))
        .then(res => res.data as Service),
    
    update: (id: string, data: Partial<Service>) =>
      apiClient
        .put(`/api/services/${id}`, { body: data })
        .validate(apiResponseSchema(z.any()))
        .then(res => res.data),
    
    delete: (id: string) =>
      apiClient
        .delete(`/api/services/${id}`)
        .validate(apiResponseSchema(z.any()))
        .then(res => res.data),
  },

  // Payments
  payments: {
    list: (params?: { limit?: number; status?: string }) =>
      apiClient
        .get('/api/payments', { searchParams: params })
        .validate(apiResponseSchema(z.array(z.any())))
        .then(res => res.data as Payment[]),
    
    get: (id: string) =>
      apiClient
        .get(`/api/payments/${id}`)
        .validate(apiResponseSchema(z.any()))
        .then(res => res.data as Payment),
    
    initiate: (data: { paymentRequestId: string; paymentMethod: string; phoneNumber: string }) =>
      apiClient
        .post('/api/payments/initiate', { body: data })
        .validate(apiResponseSchema(z.object({ paymentUrl: z.string(), paymentId: z.string() })))
        .then(res => res.data!),
    
    sendReceipt: (id: string) =>
      apiClient
        .post(`/api/payments/${id}/send-receipt`)
        .validate(apiResponseSchema(z.any()))
        .then(res => res.data),
  },

  // Operators (to be implemented on backend)
  operators: {
    list: (params?: { status?: string }) =>
      apiClient
        .get('/api/operators', { searchParams: params })
        .validate(apiResponseSchema(z.array(z.any())))
        .then(res => res.data as EconomicOperator[]),
    
    get: (id: string) =>
      apiClient
        .get(`/api/operators/${id}`)
        .validate(apiResponseSchema(z.any()))
        .then(res => res.data as EconomicOperator),
    
    create: (data: Partial<EconomicOperator>) =>
      apiClient
        .post('/api/operators', { body: data })
        .validate(apiResponseSchema(z.any()))
        .then(res => res.data as EconomicOperator),
    
    approve: (id: string, status: 'approved' | 'rejected') =>
      apiClient
        .post(`/api/operators/${id}/approve`, { body: { status } })
        .validate(apiResponseSchema(z.any()))
        .then(res => res.data),
  },
};
