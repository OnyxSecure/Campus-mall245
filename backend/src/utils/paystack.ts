import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

const paystackApi = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
  },
});

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializePayment(
  email: string,
  amount: number,
  reference: string,
  metadata?: Record<string, unknown>
): Promise<PaystackInitResponse> {
  if (!PAYSTACK_SECRET) {
    return {
      authorization_url: `${process.env.FRONTEND_URL}/payment/mock?ref=${reference}`,
      access_code: `mock_${reference}`,
      reference,
    };
  }

  const response = await paystackApi.post('/transaction/initialize', {
    email,
    amount: Math.round(amount * 100),
    reference,
    callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
    metadata,
  });

  return response.data.data;
}

export async function verifyPayment(reference: string) {
  if (!PAYSTACK_SECRET) {
    return { status: 'success', data: { status: 'success', reference } };
  }

  const response = await paystackApi.get(`/transaction/verify/${reference}`);
  return response.data;
}
