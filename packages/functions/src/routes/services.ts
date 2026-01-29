import { Hono } from 'hono';
import { db } from '../firebase';
import { requireAuth, requirePermission, type AuthContext } from '../middleware/auth';
import { createAuditLog } from '../middleware/audit';
import { validators, PERMISSIONS, type Service, type ApiResponse } from 'shared';

const services = new Hono<AuthContext>();

/**
 * GET /api/services - List all services
 */
services.get('/', requireAuth, requirePermission(PERMISSIONS.SERVICE_VIEW), async c => {
  try {
    const snapshot = await db
      .collection('services')
      .where('isActive', '==', true)
      .orderBy('name')
      .get();

    const servicesList: Service[] = [];
    snapshot.forEach(doc => {
      servicesList.push({ id: doc.id, ...doc.data() } as Service);
    });

    return c.json<ApiResponse<Service[]>>({
      success: true,
      data: servicesList,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch services',
      },
      500
    );
  }
});

/**
 * GET /api/services/:id - Get service by ID
 */
services.get('/:id', requireAuth, requirePermission(PERMISSIONS.SERVICE_VIEW), async c => {
  try {
    const id = c.req.param('id');
    const doc = await db.collection('services').doc(id).get();

    if (!doc.exists) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Service not found',
        },
        404
      );
    }

    return c.json<ApiResponse<Service>>({
      success: true,
      data: { id: doc.id, ...doc.data() } as Service,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch service',
      },
      500
    );
  }
});

/**
 * POST /api/services - Create new service
 */
services.post('/', requireAuth, requirePermission(PERMISSIONS.SERVICE_CREATE), async c => {
  try {
    const body = await c.req.json();
    const validatedData = validators.createService.parse(body);
    const user = c.get('user');

    const serviceData: Omit<Service, 'id'> = {
      ...validatedData,
      currency: 'CFA',
      isActive: true,
      createdAt: new Date(),
      createdBy: user.uid,
      updatedAt: new Date(),
      updatedBy: user.uid,
    };

    const docRef = await db.collection('services').add(serviceData);

    // Create audit log
    await createAuditLog(
      user.uid,
      user.email,
      'service.created',
      `services/${docRef.id}`,
      undefined,
      serviceData
    );

    return c.json<ApiResponse<Service>>(
      {
        success: true,
        data: { id: docRef.id, ...serviceData } as Service,
        message: 'Service created successfully',
      },
      201
    );
  } catch (error) {
    console.error('Error creating service:', error);
    return c.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create service',
      },
      400
    );
  }
});

/**
 * PUT /api/services/:id - Update service
 */
services.put('/:id', requireAuth, requirePermission(PERMISSIONS.SERVICE_UPDATE), async c => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validatedData = validators.updateService.parse(body);
    const user = c.get('user');

    // Get current state for audit
    const docRef = db.collection('services').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Service not found',
        },
        404
      );
    }

    const beforeState = doc.data();
    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
      updatedBy: user.uid,
    };

    await docRef.update(updateData);

    // Create audit log
    await createAuditLog(user.uid, user.email, 'service.updated', `services/${id}`, beforeState, {
      ...beforeState,
      ...updateData,
    });

    return c.json<ApiResponse>({
      success: true,
      message: 'Service updated successfully',
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return c.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update service',
      },
      400
    );
  }
});

/**
 * DELETE /api/services/:id - Delete (soft delete) service
 */
services.delete('/:id', requireAuth, requirePermission(PERMISSIONS.SERVICE_DELETE), async c => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');

    const docRef = db.collection('services').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Service not found',
        },
        404
      );
    }

    const beforeState = doc.data();

    // Soft delete
    await docRef.update({
      isActive: false,
      updatedAt: new Date(),
      updatedBy: user.uid,
    });

    // Create audit log
    await createAuditLog(user.uid, user.email, 'service.deleted', `services/${id}`, beforeState, {
      ...beforeState,
      isActive: false,
    });

    return c.json<ApiResponse>({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete service',
      },
      500
    );
  }
});

export default services;
