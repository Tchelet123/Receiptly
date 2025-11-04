import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { LineItem, Receipt } from "../../types";
import {
    loadNextReceipt,
    saveNextReceipt,
    loadReceipts,
    saveReceipts,
    loadSettings,
} from "../../utils/localStorage";
import { generateReceiptPdf } from "../../utils/pdf";

interface ReceiptFormProps {
    existingReceipt?: Receipt | null;
    onSaved?: (r: Receipt, options?: { printed: boolean }) => void;
}

// חישוב סכום שורה
function calcLineTotal(qty: number, unitPrice: number) {
    return Math.round(qty * unitPrice * 100) / 100;
}

// פורמט תאריך ל-DD/MM/YYYY
function formatDateDDMMYYYY(dateStr: string) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

// הדפסה בחלון חדש (הכפתור ה"ישן" שמדפיס דרך הדפדפן)
function openReceiptWindow(receipt: Receipt) {
    const settings = loadSettings();

    const businessName = settings.businessName || "שם העסק";
    const ownerName = settings.ownerName || "";
    const phone = settings.phone || "";
    const businessNumber = settings.businessNumber || "";

    const signature =
        settings.signatureDataUrl ||
        receipt.signatureDataUrl ||
        receipt.settingsSnapshot?.signatureDataUrl ||
        "";

    const displayDate = formatDateDDMMYYYY(receipt.date);
    const clientName = receipt.to || "";

    const html = `
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>קבלה ${receipt.receiptNumber}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px 0;
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      background: #f2f2f2;
      color: #111111;
    }
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 24px 32px 32px;
      box-shadow: 0 10px 24px rgba(0,0,0,0.12);
      border: 1px solid #d4d4d4;
    }
    .receipt-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid #d4d4d4;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    .business-box { flex: 2; }
    .business-name {
      margin: 0 0 6px;
    }
    .business-name-main {
      display: inline-block;
      padding-bottom: 4px;
      border-bottom: 2px solid #000000;
      font-size: 1.9rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #000000;
    }
    .business-tagline {
      font-size: 0.9rem;
      color: #444444;
      margin: 6px 0 4px;
      line-height: 1.5;
    }
    .business-tagline strong {
      font-weight: 700;
      color: #111111;
    }
    .business-call {
      margin-top: 4px;
      font-size: 0.9rem;
      color: #111111;
      font-weight: 500;
    }
    .receipt-meta {
      flex: 1.2;
      font-size: 0.9rem;
      color: #333333;
      background: #fafafa;
      border-radius: 10px;
      padding: 6px 10px;
      border: 1px solid #e0e0e0;
      align-self: flex-start;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .meta-label { color: #666666; margin-left: 8px; }
    .meta-value { font-weight: 500; }
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: #111111;
      margin: 12px 0 6px;
    }
    .to-box {
      background: #fafafa;
      border-radius: 10px;
      padding: 10px 12px;
      border: 1px solid #e0e0e0;
      font-size: 0.95rem;
      margin-bottom: 10px;
    }
    .client-name {
      font-weight: 700;
      font-size: 1.05rem;
      color: #111111;
    }
    .table-wrapper {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #d4d4d4;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    thead {
      background: #f3f3f3;
    }
    th, td {
      padding: 8px 10px;
      text-align: right;
    }
    th {
      font-weight: 600;
      color: #222222;
      border-bottom: 1px solid #d4d4d4;
    }
    tbody tr:nth-child(even) { background: #fbfbfb; }
    tbody tr:nth-child(odd) { background: #ffffff; }
    tbody td {
      border-bottom: 1px solid #ececec;
      vertical-align: top;
    }
    .numeric {
      text-align: center;
      white-space: nowrap;
    }
    .total-box {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
    .total-pill {
      background: #ffffff;
      color: #000000;
      padding: 8px 18px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 1rem;
      display: inline-flex;
      gap: 8px;
      align-items: center;
      border: 1px solid #000000;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-top: 28px;
    }
    .signature-box { flex: 1; }
    .signature-label {
      font-size: 0.9rem;
      color: #444444;
      margin-bottom: 6px;
    }
    .signature-line {
      width: 100%;
      border-bottom: 1px dashed #999999;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }
    .signature-img-wrapper { margin-top: 6px; }
    .signature-img-wrapper img {
      max-width: 260px;
      max-height: 120px;
      border-radius: 8px;
      border: 1px solid #d4d4d4;
      box-shadow: 0 4px 10px rgba(0,0,0,0.18);
    }
    .note-box {
      flex: 1;
      font-size: 0.8rem;
      color: #555555;
      background: #fafafa;
      border-radius: 10px;
      padding: 10px 12px;
      border: 1px dashed #d4d4d4;
    }
    .bottom-bar {
      margin-top: 22px;
      padding-top: 10px;
      border-top: 1px solid #e0e0e0;
      font-size: 0.75rem;
      color: #777777;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .receipt {
        box-shadow: none;
        border-radius: 0;
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <div class="business-box">
        <h1 class="business-name">
          <span class="business-name-main">${businessName}</span>
        </h1>
        <p class="business-tagline">
          קבלה רשמית מטעם <strong>${ownerName || businessName}</strong>
        </p>
        ${
        phone
            ? `<div class="business-call">📞 ${phone}</div>`
            : ""
    }
      </div>
      <div class="receipt-meta">
        <div class="meta-row">
          <span class="meta-label">תאריך</span>
          <span class="meta-value">${displayDate}</span>
        </div>
        ${
        businessNumber
            ? `<div class="meta-row">
                 <span class="meta-label">ע.פ.</span>
                 <span class="meta-value">${businessNumber}</span>
               </div>`
            : ""
    }
        <div class="meta-row">
          <span class="meta-label">מס' קבלה</span>
          <span class="meta-value">${receipt.receiptNumber}</span>
        </div>
      </div>
    </div>

    <div>
      <div class="section-title">לכבוד</div>
      <div class="to-box">
        ${
        clientName
            ? `<span class="client-name">${clientName}</span>`
            : "<span style='color:#9ca3af'>לא צויין שם הלקוח</span>"
    }
      </div>
    </div>

    <div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style="width: 55%;">פרטים</th>
              <th style="width: 10%;">כמות</th>
              <th style="width: 15%;">מחיר יחידה</th>
              <th style="width: 20%;">סה\"כ שורה</th>
            </tr>
          </thead>
          <tbody>
            ${
        receipt.lineItems.length === 0
            ? `<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:16px;">אין פריטים</td></tr>`
            : receipt.lineItems
                .map(
                    (li) => `
              <tr>
                <td>${li.description || "<span style='color:#9ca3af'>—</span>"}</td>
                <td class="numeric">${li.qty}</td>
                <td class="numeric">${li.unitPrice.toFixed(2)} ₪</td>
                <td class="numeric">${li.total.toFixed(2)} ₪</td>
              </tr>`
                )
                .join("")
    }
          </tbody>
        </table>
      </div>
    </div>

    <div class="total-box">
      <div class="total-pill">
        <span>סה\"כ לתשלום</span>
        <span>${receipt.total.toFixed(2)} ₪</span>
      </div>
    </div>

    <div class="footer-row">
      <div class="signature-box">
        <div class="signature-label">חתימת העסק</div>
        <div class="signature-line"></div>
        <div class="signature-img-wrapper">
          ${
        signature
            ? `<img src="${signature}" alt="חתימה" />`
            : `<span style="font-size:0.8rem;color:#9ca3af;">לא נשמרה חתימה במערכת</span>`
    }
        </div>
      </div>
      <div class="note-box">
        מסמך זה מהווה קבלה על קבלת תשלום.<br/>
        מומלץ לשמור עותק זה לצורך תיעוד ומעקב אחר תשלומים.<br/>
        תודה רבה שבחרתם בנו!<br/>
        <strong>${businessName}</strong>
      </div>
    </div>

    <div class="bottom-bar">
      <span>קבלה מס' ${receipt.receiptNumber}</span>
      <span>הודפס באמצעות Receiptly</span>
    </div>
  </div>

  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>
`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
}

export default function ReceiptForm({ existingReceipt, onSaved }: ReceiptFormProps) {
    const settings = loadSettings();
    const isEdit = !!existingReceipt;

    const [receiptNumber, setReceiptNumber] = useState<number>(() => {
        if (existingReceipt) return existingReceipt.receiptNumber;
        const fromNext = loadNextReceipt();
        return fromNext ?? settings.defaultReceiptNumber ?? 1;
    });

    const [date, setDate] = useState(
        existingReceipt?.date ?? new Date().toISOString().slice(0, 10)
    );
    const [to, setTo] = useState(existingReceipt?.to ?? "");
    const [lineItems, setLineItems] = useState<LineItem[]>(
        existingReceipt?.lineItems ?? [
            { id: uuidv4(), description: "", qty: 1, unitPrice: 0, total: 0 },
        ]
    );

    const total = lineItems.reduce((sum, l) => sum + (l.total || 0), 0);

    const updateLine = (id: string, patch: Partial<LineItem>) => {
        setLineItems((prev) =>
            prev.map((li) => {
                if (li.id !== id) return li;
                const nextQty = patch.qty ?? li.qty;
                const nextPrice = patch.unitPrice ?? li.unitPrice;
                return {
                    ...li,
                    ...patch,
                    total: calcLineTotal(nextQty, nextPrice),
                };
            })
        );
    };

    const addLine = () => {
        setLineItems((prev) => [
            ...prev,
            { id: uuidv4(), description: "", qty: 1, unitPrice: 0, total: 0 },
        ]);
    };

    const removeLine = (id: string) => {
        setLineItems((prev) => prev.filter((l) => l.id !== id));
    };

    const resetFormAfterSave = () => {
        setDate(new Date().toISOString().slice(0, 10));
        setTo("");
        setLineItems([
            { id: uuidv4(), description: "", qty: 1, unitPrice: 0, total: 0 },
        ]);
    };

    const hasClientName = to.trim().length > 0;
    const hasValidItem = lineItems.some(
        (li) => li.description.trim().length > 0 && li.total > 0
    );
    const hasBusinessInfo =
        settings.businessName.trim().length > 0 &&
        settings.businessNumber.trim().length > 0;

    const isValid = !!date && hasClientName && hasValidItem && hasBusinessInfo;

    type SaveMode = "save" | "print" | "pdf";

    const handleSave = async (mode: SaveMode) => {
        if (!isValid) return;

        const receipts = loadReceipts();

        const base: Receipt = {
            id: existingReceipt?.id ?? uuidv4(),
            receiptNumber,
            date,
            to,
            businessNumber: settings.businessNumber,
            lineItems,
            total,
            createdAt: existingReceipt?.createdAt ?? new Date().toISOString(),
            settingsSnapshot: settings,
            signatureDataUrl: settings.signatureDataUrl ?? undefined,
        };

        let updated: Receipt[];
        if (isEdit) {
            updated = receipts.map((r) => (r.id === base.id ? base : r));
        } else {
            updated = [base, ...receipts];
            const currentNext = loadNextReceipt();
            const nextToSave = Math.max(
                receiptNumber + 1,
                currentNext ?? 0,
                settings.defaultReceiptNumber ?? 0
            );
            saveNextReceipt(nextToSave);
            setReceiptNumber(nextToSave);
        }

        saveReceipts(updated);

        if (mode === "print") {
            openReceiptWindow(base);
        } else if (mode === "pdf") {
            await generateReceiptPdf(base);
        }

        resetFormAfterSave();
        onSaved?.(base, { printed: mode !== "save" });
    };

    return (
        <div className="card">
            <h2>{isEdit ? "עריכת קבלה" : "קבלה חדשה"}</h2>
            <div className="form-grid">
                <label>
                    תאריך
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>
                <label>
                    מספר קבלה
                    <input
                        type="number"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(Number(e.target.value))}
                    />
                </label>
                <label>
                    לכבוד
                    <input
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="שם הלקוח/ה"
                    />
                </label>
            </div>

            <h3 style={{ marginTop: 24 }}>פרטים וסכומים</h3>
            <div className="line-items">
                <div className="line-items-header">
                    <span>פרטים</span>
                    <span>כמות</span>
                    <span>מחיר יחידה</span>
                    <span>סה"כ</span>
                    <span />
                </div>
                {lineItems.map((li) => (
                    <div key={li.id} className="line-item-row">
                        <input
                            placeholder="תיאור / פרטים"
                            value={li.description}
                            onChange={(e) =>
                                updateLine(li.id, { description: e.target.value })
                            }
                        />
                        <input
                            type="number"
                            value={li.qty}
                            onChange={(e) =>
                                updateLine(li.id, { qty: Number(e.target.value) })
                            }
                        />
                        <input
                            type="number"
                            step="0.01"
                            value={li.unitPrice}
                            onChange={(e) =>
                                updateLine(li.id, { unitPrice: Number(e.target.value) })
                            }
                        />
                        <span className="line-total">
              {isNaN(li.total) ? "0.00" : li.total.toFixed(2)} ₪
            </span>
                        <button
                            type="button"
                            className="btn-icon"
                            onClick={() => removeLine(li.id)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button type="button" className="btn-secondary" onClick={addLine}>
                    הוסף שורה
                </button>
            </div>

            <div className="total-row">
                <span>סה"כ</span>
                <span>{total.toFixed(2)} ₪</span>
            </div>

            {!isValid && (
                <p style={{ marginTop: 8, fontSize: "0.8rem", color: "#b91c1c" }}>
                    כדי לשמור קבלה חייבים: תאריך, שם לקוח, פריט אחד לפחות עם סכום,
                    ושם עסק + ע.פ. בהגדרות.
                </p>
            )}

            <div className="actions-row">
                <button
                    type="button"
                    className="btn-primary"
                    disabled={!isValid}
                    onClick={() => handleSave("save")}
                >
                    שמור קבלה
                </button>
                <button
                    type="button"
                    className="btn-outline"
                    disabled={!isValid}
                    onClick={() => handleSave("print")}
                >
                    שמור והדפס (דפדפן)
                </button>
                <button
                    type="button"
                    className="btn-outline"
                    disabled={!isValid}
                    onClick={() => handleSave("pdf")}
                >
                    שמור כ-PDF (ספרייה)
                </button>
            </div>
        </div>
    );
}
