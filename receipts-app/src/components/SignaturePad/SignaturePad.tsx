import { useEffect, useRef } from "react";

interface SignaturePadProps {
    value?: string | null;
    onChange?: (dataUrl: string | null) => void;
    width?: number;
    height?: number;
}

export default function SignaturePad({
                                         value,
                                         onChange,
                                         width = 400,
                                         height = 120,
                                     }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (value) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            img.src = value;
        }
    }, [value]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        const start = (e: PointerEvent) => {
            drawing.current = true;
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        };

        const move = (e: PointerEvent) => {
            if (!drawing.current) return;
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        };

        const end = () => {
            if (!drawing.current) return;
            drawing.current = false;
            onChange?.(canvas.toDataURL("image/png"));
        };

        canvas.addEventListener("pointerdown", start);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", end);

        return () => {
            canvas.removeEventListener("pointerdown", start);
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", end);
        };
    }, [onChange]);

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onChange?.(null);
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
            />
            <div style={{ marginTop: 8, textAlign: "left" }}>
                <button type="button" className="btn-secondary" onClick={clear}>
                    נקה חתימה
                </button>
            </div>
        </div>
    );
}
