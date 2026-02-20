
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
    onSave: (signatureData: string) => void;
    onClear: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear }) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const handleClear = () => {
        sigCanvas.current?.clear();
        onClear();
    };

    const handleSave = () => {
        if (sigCanvas.current?.isEmpty()) {
            alert("Please provide a signature first.");
            return;
        }
        const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
        if (dataUrl) {
            onSave(dataUrl);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 mb-4 overflow-hidden">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        className: "w-full h-48 signature-canvas cursor-crosshair",
                        style: { width: '100%', height: '200px' }
                    }}
                />
            </div>
            <div className="flex gap-4">
                <button
                    onClick={handleClear}
                    className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-colors"
                >
                    Clear
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all"
                >
                    Confirm Signature
                </button>
            </div>
        </div>
    );
};

export default SignaturePad;
