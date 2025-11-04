import React, { useEffect, useState } from "react";
import type { BusinessSettings } from "../../types";
import { loadSettings, saveSettings } from "../../utils/localStorage";
import SignaturePad from "../SignaturePad/SignaturePad";

export default function Settings() {
    const [settings, setSettings] = useState<BusinessSettings>({
        businessName: "",
        phone: "",
        ownerName: "",
        businessNumber: "",
        defaultReceiptNumber: undefined,
        signatureDataUrl: null,
    });

    useEffect(() => {
        setSettings(loadSettings());
    }, []);

    const handleChange =
        (field: keyof BusinessSettings) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value =
                    field === "defaultReceiptNumber"
                        ? e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        : e.target.value;
                setSettings((prev) => ({ ...prev, [field]: value as any }));
            };

    const handleSave = () => {
        saveSettings(settings);
        alert("ההגדרות נשמרו 😊");
    };

    return (
        <div className="card">
            <h2>הגדרות עסק</h2>
            <div className="form-grid">
                <label>
                    שם העסק
                    <input
                        value={settings.businessName}
                        onChange={handleChange("businessName")}
                        placeholder="למשל: קבלות תכלת"
                    />
                </label>
                <label>
                    שם העוסק
                    <input
                        value={settings.ownerName}
                        onChange={handleChange("ownerName")}
                        placeholder="שם החתימה"
                    />
                </label>
                <label>
                    טלפון
                    <input
                        value={settings.phone}
                        onChange={handleChange("phone")}
                        placeholder="טלפון שיופיע על הקבלה"
                    />
                </label>
                <label>
                    מספר עסק / עוסק
                    <input
                        value={settings.businessNumber}
                        onChange={handleChange("businessNumber")}
                        placeholder="מספר עוסק / ח.פ."
                    />
                </label>
                <label>
                    מספר קבלה התחלתי (אופציונלי)
                    <input
                        type="number"
                        value={settings.defaultReceiptNumber ?? ""}
                        onChange={handleChange("defaultReceiptNumber")}
                    />
                </label>
            </div>

            <div style={{ marginTop: 24 }}>
                <h3>חתימה שתופיע בקבלה</h3>
                <p style={{ marginBottom: 8 }}>
                    ציירי כאן את החתימה שלך. היא תישמר ותופיע על כל קבלה.
                </p>
                <SignaturePad
                    value={settings.signatureDataUrl}
                    onChange={(dataUrl) =>
                        setSettings((prev) => ({ ...prev, signatureDataUrl: dataUrl }))
                    }
                />
            </div>

            <div style={{ marginTop: 24, textAlign: "left" }}>
                <button className="btn-primary" onClick={handleSave}>
                    שמור הגדרות
                </button>
            </div>
        </div>
    );
}
