import { useState } from "react";
import * as walletService from "../services/wallet.service";
import Toast from "../../../shared/components/Toast";

const formatCurrency = (amount) => {
    // Chuyển sang định dạng tiếng Anh (USD) - Nếu vẫn muốn hiện VND thì đổi 'en-US' thành 'vi-VN'
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount || 0);
};

export default function DepositPage() {
    const [amount, setAmount] = useState("");
    const [depositData, setDepositData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ msg: "", kind: "success" });

    const handleCreateDeposit = async () => {
        // Minimum deposit logic (e.g., $10 or 10,000 VND)
        if (!amount || amount < 10) {
            setToast({
                msg: "Minimum deposit amount is $10.00",
                kind: "error",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await walletService.createDepositRequest(amount);
            const data = response.data || response;

            if (data) {
                setDepositData(data);
                setToast({
                    msg: "Payment QR code generated!",
                    kind: "success",
                });
            }
        } catch (err) {
            console.error("Deposit Error:", err);
            setToast({
                msg: err.response?.data?.message || "Internal Server Error",
                kind: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <Toast
                message={toast.msg}
                kind={toast.kind}
                onClose={() => setToast({ ...toast, msg: "" })}
            />

            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                        Deposit Funds
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Top up your wallet via VietQR Bank Transfer
                    </p>
                </div>

                <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100">
                    {!depositData ? (
                        /* STEP 1: INPUT AMOUNT */
                        <div className="p-8">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                                    Enter Deposit Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                        USD
                                    </span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(e.target.value)
                                        }
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-16 pr-4 text-xl font-bold text-slate-900 outline-none ring-indigo-500 focus:ring-2 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="mt-3 text-xs text-slate-400 italic leading-relaxed">
                                    * Important: Please use the correct transfer
                                    content (Ref Code) for automated processing.
                                </p>
                            </div>

                            <button
                                onClick={handleCreateDeposit}
                                disabled={loading}
                                className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading
                                    ? "Processing..."
                                    : "Generate Payment QR"}
                            </button>
                        </div>
                    ) : (
                        /* STEP 2: SHOW QR CODE */
                        <div className="p-8 animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => setDepositData(null)}
                                    className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                    ← Go Back
                                </button>
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-600 uppercase tracking-wider">
                                    Pending
                                </span>
                            </div>

                            <div className="flex flex-col items-center">
                                {/* Elegant QR Container */}
                                <div className="relative rounded-3xl border-4 border-slate-100 p-2 bg-white shadow-inner mb-6">
                                    <img
                                        src={`https://img.vietqr.io/image/TPB-44478248888-compact.jpg?amount=${depositData.amount}&addInfo=${depositData.code}&accountName=LE%20LONG%20PHU`}
                                        alt="VietQR"
                                        className="w-64 h-64 rounded-2xl"
                                    />
                                    <div className="absolute -top-3 -right-3 bg-slate-900 text-white p-2.5 rounded-full shadow-lg border-2 border-white">
                                        🏦
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-1">
                                    Scan to Pay
                                </h3>
                                <p className="text-sm text-slate-500 mb-8 text-center px-4">
                                    Open your banking app to scan this QR code
                                    and complete the transfer.
                                </p>

                                {/* Transaction Details Table */}
                                <div className="w-full space-y-3 rounded-2xl bg-slate-50 p-5 border border-slate-100">
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-sm text-slate-500 font-medium">
                                            Amount
                                        </span>
                                        <span className="font-bold text-slate-900">
                                            {formatCurrency(depositData.amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-sm text-slate-500 font-medium">
                                            Ref Code
                                        </span>
                                        <span className="font-mono font-black text-red-600 text-lg uppercase">
                                            {depositData.code}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500 font-medium">
                                            Status
                                        </span>
                                        <span className="text-sm font-bold text-slate-900 italic">
                                            Awaiting verification...
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 rounded-xl bg-slate-900 p-4 shadow-xl shadow-slate-200">
                                <p className="text-[11px] text-slate-300 leading-relaxed text-center">
                                    Funds will be credited to your wallet within{" "}
                                    <strong>5-10 minutes</strong> after
                                    successful transfer. Please{" "}
                                    <strong>do not close</strong> this page
                                    until the transaction is completed.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
