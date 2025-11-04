export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface BusinessSettings {
  businessName: string;
  phone: string;
  ownerName: string;
  businessNumber: string;
  defaultReceiptNumber?: number;
  signatureDataUrl?: string | null;
}

export interface Receipt {
  id: string;
  receiptNumber: number;
  date: string; // YYYY-MM-DD
  to: string;   // "לכבוד"
  businessNumber: string;
  lineItems: LineItem[];
  total: number;
  createdAt: string; // ISO
  settingsSnapshot?: BusinessSettings;
  signerDataUrl?: string | null;
}
