import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Supabase URL or Anonymous Key is missing. Check your environment variables.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupplementDelivery = {
  id: number;
  delivery_date?: string;
  supplement_type: string;
  recipient_name: string;
  quantity: number;
  invoice_number?: string;
  is_send: boolean;
  customer_request: boolean;
}