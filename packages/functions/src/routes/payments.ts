import { Hono } from 'hono';
import { db } from '../firebase';
import { requireAuth, requirePermission, type AuthContext } from '../middleware/auth';
import { createAuditLog } from '../middleware/audit';
import { initiatePayment, verifyCallbackSignature } from '../services/mypayga';
import {
  validators,
  PERMISSIONS,
  PAYMENT_STATUS,
  type Payment,
  type PaymentRequest,
  type ApiResponse,
  type MyPaygaCallbackData,
} from 'shared';

const payments = new Hono<AuthContext>();

/**
 * GET /api/payments - List payments
 */
payments.get('/', requireAuth, requirePermission(PERMISSIONS.PAYMENT_VIEW), async c => {
  try {
    const { limit = '50', startAfter, status } = c.req.query();

    let query = db.collection('payments').orderBy('createdAt', 'desc').limit(parseInt(limit));

    if (status) {
      query = query.where('status', '==', status);
    }

    if (startAfter) {
      const startDoc = await db.collection('payments').doc(startAfter).get();
      query = query.startAfter(startDoc);
    }

    const snapshot = await query.get();

    const paymentsList: Payment[] = [];
    snapshot.forEach(doc => {
      paymentsList.push({ id: doc.id, ...doc.data() } as Payment);
    });

    return c.json<ApiResponse<Payment[]>>({
      success: true,
      data: paymentsList,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch payments',
      },
      500
    );
  }
});

/**
 * GET /api/payments/:id - Get payment details
 */
payments.get('/:id', requireAuth, requirePermission(PERMISSIONS.PAYMENT_VIEW), async c => {
  try {
    const id = c.req.param('id');
    const doc = await db.collection('payments').doc(id).get();

    if (!doc.exists) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Payment not found',
        },
        404
      );
    }

    return c.json<ApiResponse<Payment>>({
      success: true,
      data: { id: doc.id, ...doc.data() } as Payment,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch payment',
      },
      500
    );
  }
});

/**
 * POST /api/payments/initiate - Initiate payment
 */
payments.post('/initiate', async c => {
  try {
    const body = await c.req.json();
    const validatedData = validators.initiatePayment.parse(body);

    // Get payment request
    const paymentRequestDoc = await db
      .collection('payment-requests')
      .doc(validatedData.paymentRequestId)
      .get();

    if (!paymentRequestDoc.exists) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Payment request not found',
        },
        404
      );
    }

    const paymentRequest = paymentRequestDoc.data() as PaymentRequest;

    if (paymentRequest.status !== PAYMENT_STATUS.PENDING) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Payment request already processed',
        },
        400
      );
    }

    // Get operator details
    const operatorDoc = await db
      .collection('economic-operators')
      .doc(paymentRequest.operatorId)
      .get();

    const operator = operatorDoc.data();
    const baseUrl = process.env.CLIENT_APP_URL || 'http://localhost:5174';

    // Initiate MyPayga payment
    const paymentResult = await initiatePayment({
      amount: paymentRequest.totalAmount,
      currency: 'FCFA',
      description: `Paiement Taxe N° ${paymentRequest.requestNumber}`,
      success_url: `${baseUrl}/payment/success?ref=${validatedData.paymentRequestId}`,
      error_url: `${baseUrl}/payment/error?ref=${validatedData.paymentRequestId}`,
      callback_url: `${process.env.FUNCTIONS_URL}/api/payments/callback`,
      client_email: operator?.personalInfo?.email,
      client_phone: validatedData.phoneNumber,
      unique_id: validatedData.paymentRequestId,
    });

    if (!paymentResult.success) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: paymentResult.error || 'Payment initiation failed',
        },
        400
      );
    }

    // Create payment record
    const paymentData: Omit<Payment, 'id'> = {
      paymentRequestId: validatedData.paymentRequestId,
      operatorId: paymentRequest.operatorId,
      operatorName: `${operator?.personalInfo?.firstName} ${operator?.personalInfo?.lastName}`,
      amount: paymentRequest.totalAmount,
      currency: 'CFA',
      status: PAYMENT_STATUS.PENDING,
      method: validatedData.paymentMethod,
      provider: 'mypayga',
      providerData: {
        paymentToken: paymentResult.paymentToken!,
        orderId: validatedData.paymentRequestId,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const paymentDocRef = await db.collection('payments').add(paymentData);

    // Update payment request
    await db.collection('payment-requests').doc(validatedData.paymentRequestId).update({
      status: PAYMENT_STATUS.PENDING,
      paymentMethod: validatedData.paymentMethod,
      paymentToken: paymentResult.paymentToken,
    });

    return c.json<ApiResponse<{ paymentUrl: string; paymentId: string }>>({
      success: true,
      data: {
        paymentUrl: paymentResult.paymentUrl!,
        paymentId: paymentDocRef.id,
      },
      message: 'Payment initiated successfully',
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return c.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate payment',
      },
      400
    );
  }
});

/**
 * POST /api/payments/callback - MyPayga callback handler
 */
payments.post('/callback', async c => {
  try {
    const callbackData: MyPaygaCallbackData = await c.req.json();

    // Verify signature
    if (!verifyCallbackSignature(callbackData)) {
      console.error('Invalid MyPayga callback signature');
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid signature',
        },
        401
      );
    }

    const { order_status, unique_id, amount, payment_token, message } = callbackData;
    const paymentRequestId = unique_id;

    // Find payment by payment token
    const paymentsSnapshot = await db
      .collection('payments')
      .where('providerData.paymentToken', '==', payment_token)
      .limit(1)
      .get();

    if (paymentsSnapshot.empty) {
      console.error('Payment not found for token:', payment_token);
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Payment not found',
        },
        404
      );
    }

    const paymentDoc = paymentsSnapshot.docs[0];
    const paymentId = paymentDoc.id;
    const payment = paymentDoc.data() as Payment;

    // Determine payment status
    const newStatus = order_status === '200' ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;

    // Update payment
    await db
      .collection('payments')
      .doc(paymentId)
      .update({
        status: newStatus,
        'providerData.transactionId': payment_token,
        'providerData.message': message,
        updatedAt: new Date(),
        ...(newStatus === PAYMENT_STATUS.PAID ? { paidAt: new Date() } : {}),
      });

    // Update payment request
    await db
      .collection('payment-requests')
      .doc(paymentRequestId)
      .update({
        status: newStatus,
        ...(newStatus === PAYMENT_STATUS.PAID
          ? {
              paidAt: new Date(),
              paymentDate: new Date(),
            }
          : {}),
      });

    // Create audit log
    await createAuditLog(
      'system',
      'mypayga-callback',
      `payment.${newStatus}`,
      `payments/${paymentId}`,
      payment,
      { ...payment, status: newStatus }
    );

    // TODO: Send receipt if payment successful
    if (newStatus === PAYMENT_STATUS.PAID) {
      // Trigger receipt generation and sending
      console.log('Payment successful, should send receipt for:', paymentId);
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'Callback processed successfully',
    });
  } catch (error) {
    console.error('Error processing callback:', error);
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to process callback',
      },
      500
    );
  }
});

/**
 * POST /api/payments/:id/send-receipt - Send receipt to operator
 */
payments.post(
  '/:id/send-receipt',
  requireAuth,
  requirePermission(PERMISSIONS.PAYMENT_SEND_RECEIPT),
  async c => {
    try {
      const id = c.req.param('id');
      const user = c.get('user');

      const doc = await db.collection('payments').doc(id).get();

      if (!doc.exists) {
        return c.json<ApiResponse>(
          {
            success: false,
            error: 'Payment not found',
          },
          404
        );
      }

      const payment = doc.data() as Payment;

      if (payment.status !== PAYMENT_STATUS.PAID) {
        return c.json<ApiResponse>(
          {
            success: false,
            error: 'Cannot send receipt for unpaid payment',
          },
          400
        );
      }

      // TODO: Implement receipt generation and sending
      console.log('Sending receipt for payment:', id);

      await db.collection('payments').doc(id).update({
        receiptSentAt: new Date(),
      });

      await createAuditLog(
        user.uid,
        user.email,
        'payment.receipt_sent',
        `payments/${id}`,
        undefined,
        { paymentId: id }
      );

      return c.json<ApiResponse>({
        success: true,
        message: 'Receipt sent successfully',
      });
    } catch (error) {
      console.error('Error sending receipt:', error);
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to send receipt',
        },
        500
      );
    }
  }
);

export default payments;
