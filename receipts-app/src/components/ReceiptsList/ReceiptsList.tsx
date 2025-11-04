import React, { useEffect, useState } from "react";
import type { Receipt } from "../../types";
import {
    loadReceipts,
    exportAllAsJSON,
    importFromJSON,
} from "../../utils/localStorage";

interface ReceiptsListProps {
    onEdit: (r: Receipt) => void;
    refreshKey: number;
}

export default function ReceiptsList({ onEdit, refreshKey }: ReceiptsListProps) {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        setReceipts(loadReceipts());
    }, [refreshKey]);

    const filtered = receipts.filter((r) => {
        const textMatch =
            search.trim() === "" ||
            r.to.includes(search) ||
            String(r.receiptNumber).includes(search);
        const afterFrom = !dateFrom || r.date >= dateFrom;
        const beforeTo = !dateTo || r.date <= dateTo;
        return textMatch && afterFrom && beforeTo;
    });

    const handleDownload = () => {
        const data = exportAllAsJSON();
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receipts-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        importFromJSON(text);
        setReceipts(loadReceipts());
        alert("הקובץ נטען בהצלחה ✔");
    };

    return (
        <div className="card">
            <h2>קבלות קודמות</h2>
            <div className="filters-row">
                <input
                    placeholder="חיפוש לפי לכבוד / מספר קבלה"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="filters-dates">
                    <label>
                        מתאריך
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </label>
                    <label>
                        עד תאריך
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </label>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="receipts-table">
                    <thead>
                    <tr>
                        <th>מס'</th>
                        <th>תאריך</th>
                        <th>לכבוד</th>
                        <th>סה"כ</th>
                        <th>נוצר ב</th>
                        <th>פעולות</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                                אין קבלות להצגה
                            </td>
                        </tr>
                    ) : (
                        filtered.map((r) => (
                            <tr key={r.id}>
                                <td>{r.receiptNumber}</td>
                                <td>{r.date}</td>
                                <td>{r.to}</td>
                                <td>₪ {r.total.toFixed(2)}</td>
                                <td>{new Date(r.createdAt).toLocaleString("he-IL")}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn-small"
                                        onClick={() => onEdit(r)}
                                    >
                                        עריכה / הדפסה
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="backup-row">
                <div>
                    <h3>גיבוי ושחזור</h3>
                    <p>
                        כאן אפשר להוריד קובץ JSON עם כל המידע של האתר, ולהעלות אותו במכשיר
                        אחר כדי להעביר את הקבלות.
                    </p>
                </div>
                <div className="backup-actions">
                    <button type="button" className="btn-outline" onClick={handleDownload}>
                        הורד קובץ JSON
                    </button>
                    <label className="upload-label">
                        העלאת קובץ JSON
                        <input
                            type="file"
                            accept="application/json"
                            onChange={handleUpload}
                            style={{ display: "none" }}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
