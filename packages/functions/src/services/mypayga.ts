import type { MyPaygaCallbackData, MyPaygaPaymentInitRequest } from 'shared';
import { createHmac } from 'crypto';

const MYPAYGA_API_URL = 'https://api.mypayga.com';
const MYPAYGA_API_KEY = process.env.MYPAYGA_API_KEY || '';
const MYPAYGA_SECRET_KEY = process.env.MYPAYGA_SECRET_KEY || '';

export interface PaymentInitResponse {
  success: boolean;
  paymentToken?: string;
  paymentUrl?: string;
  message?: string;
  error?: string;
}

/**
 * Initialize a payment with MyPayga
 */
export const initiatePayment = async (
  paymentData: MyPaygaPaymentInitRequest
): Promise<PaymentInitResponse> => {
  try {
    const response = await fetch(`${MYPAYGA_API_URL}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: MYPAYGA_API_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (result.statusRequest === 200 || result.status === 200) {
      return {
        success: true,
        paymentToken: result.payment_token,
        paymentUrl: result.payment_url,
        message: result.message,
      };
    } else {
      return {
        success: false,
        error: result.message || 'Payment initiation failed',
      };
    }
  } catch (error) {
    console.error('MyPayga payment initiation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Verify MyPayga callback signature
 */
export const verifyCallbackSignature = (callbackData: MyPaygaCallbackData): boolean => {
  const {
    hash,
    order_status,
    unique_id,
    amount,
    payment_token,
    payment_method,
    message,
    client_phone = '',
  } = callbackData;

  // Reconstruct the data string as per MyPayga documentation
  const dataString = `${order_status}${unique_id}${amount}${payment_token}${payment_method}${message}${client_phone}`;

  // Calculate HMAC SHA512
  const expectedHash = createHmac('sha512', MYPAYGA_SECRET_KEY).update(dataString).digest('hex');

  return hash === expectedHash;
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (paymentToken: string): Promise<any> => {
  try {
    const response = await fetch(
      `${MYPAYGA_API_URL}/verify?apikey=${MYPAYGA_API_KEY}&payment_token=${paymentToken}`,
      {
        method: 'GET',
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('MyPayga status check error:', error);
    throw error;
  }
};

/**
 * Get network from phone number for Gabon
 */
export const getNetwork = async (
  phoneNumber: string
): Promise<{
  network?: string;
  mobileMoneyService?: string;
  mobileMoneyCode?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${MYPAYGA_API_URL}/network?apikey=${MYPAYGA_API_KEY}&tel_number=${phoneNumber}&country=GA&type=mobile_money`,
      {
        method: 'GET',
      }
    );

    const result = await response.json();

    if (result.statusRequest === 200) {
      return {
        network: result.network,
        mobileMoneyService: result.mobile_money_svce,
        mobileMoneyCode: result.mobile_money_code,
      };
    } else {
      return {
        error: result.message || 'Network detection failed',
      };
    }
  } catch (error) {
    console.error('MyPayga network detection error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
