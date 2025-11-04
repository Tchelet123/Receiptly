// src/utils/pdf.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Receipt } from "../types";
import { loadSettings } from "./localStorage";

// יצירת PDF נקי ויפה בשחור-לבן מתוך הקבלה
export async function generateReceiptPdf(receipt: Receipt) {
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

    // אלמנט נסתר שנוסיף לדף רק לצורך ה-PDF
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-10000px";
    container.style.top = "0";
    container.style.width = "800px";
    container.style.background = "#ffffff";
    container.dir = "rtl";

    container.innerHTML = `
    <style>
      * { box-sizing: border-box; }
      .receipt-pdf {
        max-width: 800px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 24px 32px 32px;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        color: #111111;
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
    </style>

    <div class="receipt-pdf">
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
        <span>נוצר ב-Receiptly</span>
      </div>
    </div>
  `;

    document.body.appendChild(container);
    const element = container.querySelector(".receipt-pdf") as HTMLElement;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`receipt-${receipt.receiptNumber}.pdf`);

    document.body.removeChild(container);
}

function formatDateDDMMYYYY(dateStr: string) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}
