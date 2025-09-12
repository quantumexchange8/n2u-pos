import { formatAmount } from "@/Composables";
import { useState } from "react";
import Button from "./Button";

export default function Numpad({ value = "0.00", onSave, onClose }) {

    const [cents, setCents] = useState(() => {
        // store value as integer cents (e.g. "12.34" → 1234)
        return Math.round(parseFloat(value || "0") * 100);
    });

    const formatValue = (c) => (c / 100).toFixed(2);

    const handlePress = (btn) => {
        if (btn === "C") {
            setCents(0);
        } else if (btn === "⌫") {
            setCents((prev) => Math.floor(prev / 10));
        } else {
            setCents((prev) => prev * 10 + parseInt(btn, 10));
        }
    };


    const buttons = [
        "1","2","3",
        "4","5","6",
        "7","8","9",
        "0","00","⌫"
    ];

    return (
        <div className="flex flex-col gap-2">
            {/* Display */}
            <div className="text-center text-xxl font-sans font-bold border p-5 rounded bg-gray-100">
                RM {formatValue(cents)}
            </div>

            {/* Grid Buttons */}
            <div className="grid grid-cols-3 gap-3 p-3">
                {buttons.map((btn, idx) => (
                    <button
                        key={idx}
                        className="p-4 rounded-lg shadow bg-white hover:bg-gray-200 text-xl font-semibold"
                        onClick={() => handlePress(btn)}
                    >
                        {btn}
                    </button>
                ))}
            </div>

            {/* Save Button */}
            <div className="p-3">
                <Button
                    size="lg"
                    className="w-full flex items-center justify-center"
                    onClick={() => {
                        onSave?.(formatValue(cents)); // ✅ only pass back on save
                        onClose?.(); // close modal after save
                    }}
                >
                    Save
                </Button>
            </div>
        </div>
    )
}