// Razorpay Payment Service - Mock/Placeholder Mode
// Replace RAZORPAY_KEY_ID with real key when going to production

const RAZORPAY_KEY_ID = 'rzp_test_PLACEHOLDER'; // Replace with real key
const MOCK_MODE = true; // Set to false when Razorpay is configured

export interface PaymentOrder {
  orderId: string;
  amount: number; // in paise (₹70 = 7000 paise)
  currency: string;
  receipt: string;
  householdName: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  orderId: string;
  signature: string;
  method: string; // 'upi' | 'card' | 'netbanking'
}

// Create a payment order (in production, this calls your backend/edge function)
export async function createPaymentOrder(amount: number, receipt: string): Promise<PaymentOrder> {
  if (MOCK_MODE) {
    // Simulate order creation
    return {
      orderId: `order_mock_${Date.now()}`,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt,
      householdName: 'Household',
    };
  }

  // Production: Call your Supabase edge function that creates a Razorpay order
  // const response = await fetch(`${SUPABASE_URL}/functions/v1/process-payment`, { ... });
  throw new Error('Razorpay not configured. Set RAZORPAY_KEY_ID.');
}

// Process payment (in production, opens Razorpay checkout)
export async function processPayment(order: PaymentOrder): Promise<PaymentResult> {
  if (MOCK_MODE) {
    // Simulate 2 second payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      paymentId: `pay_mock_${Date.now()}`,
      orderId: order.orderId,
      signature: `sig_mock_${Date.now()}`,
      method: 'upi',
    };
  }

  // Production: Open Razorpay checkout
  // const options = {
  //   key: RAZORPAY_KEY_ID,
  //   amount: order.amount,
  //   currency: order.currency,
  //   name: 'Kabadiwala',
  //   description: `Payment for scrap pickup - ${order.receipt}`,
  //   order_id: order.orderId,
  //   prefill: { method: 'upi' },
  // };
  // const razorpay = new RazorpayCheckout(options);
  // return razorpay.open();
  throw new Error('Razorpay not configured.');
}

// Verify payment (in production, verifies with Razorpay server)
export async function verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
  if (MOCK_MODE) {
    return true; // Always succeeds in mock mode
  }
  // Production: Call backend to verify signature
  throw new Error('Razorpay not configured.');
}

export function isPaymentConfigured(): boolean {
  return !MOCK_MODE && RAZORPAY_KEY_ID !== 'rzp_test_PLACEHOLDER';
}
