export interface Transaction {
  id: string;
  booking_id: string;
  household_id: string;
  kabadiwala_id: string;
  total_amount: number;          // Total value of scrap
  commission_amount: number;     // Platform commission (10%)
  kabadiwala_payout: number;     // Amount kabadiwala receives (90%)
  household_payment: number;     // Amount household receives (full amount)
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  items: TransactionItem[];
  receipt_url: string | null;
  created_at: string;
  completed_at: string | null;
}

export type PaymentMethod = 'upi' | 'cash' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface TransactionItem {
  id: string;
  transaction_id: string;
  category_id: string;
  category_name: string;
  weight_kg: number;
  rate_per_kg: number;
  amount: number;
}

export interface Receipt {
  id: string;
  transaction_id: string;
  booking_id: string;
  household_name: string;
  kabadiwala_name: string;
  items: TransactionItem[];
  total_amount: number;
  commission_amount: number;
  net_payout: number;
  payment_method: PaymentMethod;
  receipt_number: string;
  generated_at: string;
  pdf_url: string | null;
}

export interface EarningsSummary {
  today: number;
  this_week: number;
  this_month: number;
  total: number;
  total_pickups: number;
  total_commission_paid: number;
  pending_payout: number;
}

export interface EarningsBreakdown {
  date: string;
  bookings_count: number;
  total_earned: number;
  commission_deducted: number;
  net_earned: number;
  materials: {
    category_name: string;
    weight_kg: number;
    amount: number;
  }[];
}
