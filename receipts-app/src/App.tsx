import  { useState } from "react";
import ReceiptForm from "./components/ReceiptForm/ReceiptForm";
import ReceiptsList from "./components/ReceiptsList/ReceiptsList";
import Settings from "./components/Settings/Settings";
import type { Receipt } from "./types";

type Page = "create" | "list" | "settings";

export default function App() {
    const [page, setPage] = useState<Page>("create");
    const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const goToCreateNew = () => {
        setEditingReceipt(null);
        setPage("create");
    };

    return (
        <div className="app-root">
            <header className="app-header">
                <div className="brand">
                    <span className="brand-logo">₪</span>
                    <span className="brand-title">Receiptly</span>
                </div>
                <nav className="nav-tabs">
                    <button
                        className={page === "create" ? "nav-tab active" : "nav-tab"}
                        onClick={goToCreateNew}
                    >
                        קבלה חדשה
                    </button>
                    <button
                        className={page === "list" ? "nav-tab active" : "nav-tab"}
                        onClick={() => setPage("list")}
                    >
                        קבלות קודמות
                    </button>
                    <button
                        className={page === "settings" ? "nav-tab active" : "nav-tab"}
                        onClick={() => setPage("settings")}
                    >
                        הגדרות
                    </button>
                </nav>
            </header>

            <main className="app-main">
                {page === "create" && (
                    <ReceiptForm
                        existingReceipt={editingReceipt}
                        onSaved={() => {
                            setEditingReceipt(null);
                            setRefreshKey((k) => k + 1);
                        }}
                    />
                )}

                {page === "list" && (
                    <ReceiptsList
                        refreshKey={refreshKey}
                        onEdit={(r) => {
                            setEditingReceipt(r);
                            setPage("create");
                        }}
                    />
                )}

                {page === "settings" && <Settings />}
            </main>
        </div>
    );
}
