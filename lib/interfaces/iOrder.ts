export interface iProduct {
  id: number;
  title: string;
}

export type PaymentStatus = "cancelled" | "pending" | "paid" | "processing";

export interface iOrderItem {
  id: number;
  documentId: string;
  payment_status: PaymentStatus;
  variant: string;
  quantity: number;
  shipping_location: string;
  event_date: string;
  loading_date: string;
  customer_name: string;
  telp: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  loading_time: string;
  products: iProduct[];
  order_id: string;
  email: string;
  event_type: string | null;
  verification: string | null;
  vendor_doc_id: string;
}
