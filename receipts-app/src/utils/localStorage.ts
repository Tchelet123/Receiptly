import type { Receipt, BusinessSettings } from "../types";

const KEYS = {
  RECEIPTS: "receipts_app.receipts",
  SETTINGS: "receipts_app.settings",
  NEXT_RECEIPT: "receipts_app.next_receipt",
};

export function loadReceipts(): Receipt[] {
  try {
    const raw = localStorage.getItem(KEYS.RECEIPTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Receipt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReceipts(list: Receipt[]) {
  localStorage.setItem(KEYS.RECEIPTS, JSON.stringify(list));
}

export function loadSettings(): BusinessSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      return {
        businessName: "",
        phone: "",
        ownerName: "",
        businessNumber: "",
        defaultReceiptNumber: undefined,
        signatureDataUrl: null,
      };
    }
    const parsed = JSON.parse(raw) as Partial<BusinessSettings>;
    return {
      businessName: parsed.businessName ?? "",
      phone: parsed.phone ?? "",
      ownerName: parsed.ownerName ?? "",
      businessNumber: parsed.businessNumber ?? "",
      defaultReceiptNumber: parsed.defaultReceiptNumber,
      signatureDataUrl: parsed.signatureDataUrl ?? null,
    };
  } catch {
    return {
      businessName: "",
      phone: "",
      ownerName: "",
      businessNumber: "",
      defaultReceiptNumber: undefined,
      signatureDataUrl: null,
    };
  }
}

export function saveSettings(s: BusinessSettings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(s));
}

export function loadNextReceipt(): number | null {
  const raw = localStorage.getItem(KEYS.NEXT_RECEIPT);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function saveNextReceipt(n: number) {
  localStorage.setItem(KEYS.NEXT_RECEIPT, String(n));
}

export function exportAllAsJSON() {
  const data = {
    receipts: loadReceipts(),
    settings: loadSettings(),
    nextReceipt: loadNextReceipt(),
  };
  return JSON.stringify(data, null, 2);
}

export function importFromJSON(jsonStr: string) {
  const parsed = JSON.parse(jsonStr);
  if (parsed.receipts) saveReceipts(parsed.receipts);
  if (parsed.settings) saveSettings(parsed.settings);
  if (parsed.nextReceipt !== undefined && parsed.nextReceipt !== null) {
    saveNextReceipt(parsed.nextReceipt);
  }
}
