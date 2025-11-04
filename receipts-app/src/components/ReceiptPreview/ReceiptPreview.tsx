import type { Receipt } from '../../types';

export default function ReceiptPreview({ r }: { r: Receipt }) {
    return (
        <div className="receipt-preview" style={{ width: 700, padding: 16, border: '1px solid #ddd' }}>
            <div style={{ textAlign: 'center' }}>
                <h1>{r.settingsSnapshot?.businessName || 'שם העסק'}</h1>
                <div>{r.settingsSnapshot?.phone}</div>
            </div>
            <div style={{ marginTop: 12 }}>
                <div>קבלה מס': {r.receiptNumber}</div>
                <div>תאריך: {r.date}</div>
                <div>לכבוד: {r.to}</div>
            </div>

            <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    <th>כמות</th><th>תיאור</th><th>מחיר יחידה</th><th>סה"כ</th>
                </tr>
                </thead>
                <tbody>
                {r.lineItems.map(li => (
                    <tr key={li.id}>
                        <td>{li.qty}</td>
                        <td>{li.description}</td>
                        <td>{li.unitPrice.toFixed(2)}</td>
                        <td>{li.total.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: 8 }}>
                <strong>סה"כ: ₪{r.total.toFixed(2)}</strong>
            </div>

            <div style={{ marginTop: 20 }}>
                <div>חתימה:</div>
                {r.signatureDataUrl ? (
                    <img src={r.signatureDataUrl} alt="חתימת העסק" style={{ width: 240, borderRadius: 8 }} />
                ) : (
                    <div style={{ color: '#999' }}>אין חתימה</div>
                )}

            </div>
            <div style={{ marginTop: 12 }}>
                <button onClick={() => { const printWindow = window.open('', '_blank'); if (!printWindow) return; printWindow.document.write('<html><head><title>קבלה</title></head><body>' + document.querySelector('.receipt-preview')!.innerHTML + '</body></html>'); printWindow.document.close(); printWindow.print(); }}>הדפס קבלה</button>
            </div>
        </div>
    );
}
