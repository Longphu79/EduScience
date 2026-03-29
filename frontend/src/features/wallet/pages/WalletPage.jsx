import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    DollarSign,
    Landmark,
    User,
    ArrowRight,
    Wallet,
    History,
    AlertTriangle,
} from "lucide-react";
import walletService from "../services/wallet.service";

const WalletPage = () => {
    const [wallet, setWallet] = useState(null);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [bankInfo, setBankInfo] = useState({
        bankCode: "TPB", // Mặc định là TPB
        accountNumber: "",
        accountName: "",
    });

    const SUPPORTED_BANKS = [
        { id: "TPB", name: "TPBank" },
        { id: "VCB", name: "Vietcombank" },
        { id: "MB", name: "MBBank" },
        { id: "TCB", name: "Techcombank" },
        { id: "ICB", name: "VietinBank" },
        { id: "ACB", name: "ACB" },
        { id: "VPB", name: "VPBank" },
    ];

    const loadWallet = async () => {
        try {
            const res = await walletService.getMyWallet();
            if (res && res.data) {
                setWallet(res.data);
            }
        } catch (error) {
            console.error("wallet error", error);
            toast.error("Cannot load wallet information. Please try again.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadWallet();
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();

        if (!amount || Number(amount) < 50000) {
            return toast.warning("Minimum withdrawal amount is 50,000 VND");
        }

        if (!bankInfo.accountNumber || !bankInfo.accountName) {
            return toast.warning("Please fill in all bank information");
        }

        try {
            setLoading(true);

            // Tìm tên ngân hàng đầy đủ dựa trên mã bankCode đã chọn
            const selectedBank = SUPPORTED_BANKS.find(
                (b) => b.id === bankInfo.bankCode,
            );

            const body = {
                amount: Number(amount),
                bankInfo: {
                    bankCode: bankInfo.bankCode,
                    bankName: selectedBank ? selectedBank.name : "Unknown Bank",
                    accountNumber: bankInfo.accountNumber,
                    accountName: bankInfo.accountName.toUpperCase(),
                },
            };

            const res = await walletService.createWithdrawalRequest(body);
            toast.success(
                res.message || "Withdrawal request submitted successfully!",
            );

            await loadWallet();
            setAmount("");
        } catch (error) {
            console.error("Lỗi rút tiền:", error);
            const errorMsg =
                error.response?.data?.message ||
                "An error occurred while sending the request";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                    <p className="font-medium text-slate-600">
                        Loading your wallet...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-6 md:py-12">
            <div className="mx-auto max-w-7xl">
                {/* Header Zone */}
                <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tighter text-slate-950 md:text-4xl">
                            My Wallet Center
                        </h1>
                        <p className="mt-1 text-slate-600">
                            Manage your balance, earnings, and withdrawal
                            requests securely.
                        </p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95">
                        <History className="h-4 w-4" />
                        View Transaction History
                    </button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,minmax(400px,auto)]">
                    <div className="space-y-8">
                        {/* Balance Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-100">
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500 opacity-60"></div>
                            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-700 opacity-50"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-lg">
                                            <Wallet className="h-7 w-7 text-indigo-100" />
                                        </div>
                                        <p className="font-semibold text-indigo-100 uppercase tracking-wide text-sm">
                                            Available Balance
                                        </p>
                                    </div>
                                    <Landmark className="h-6 w-6 text-indigo-200" />
                                </div>

                                <div className="mt-10 mb-2">
                                    <p className="text-sm opacity-90">
                                        Current VND Balance
                                    </p>
                                    <p className="text-5xl font-extrabold tracking-tighter md:text-6xl">
                                        {wallet?.balance?.toLocaleString() || 0}
                                        <span className="text-3xl font-bold text-indigo-200">
                                            {" "}
                                            VND
                                        </span>
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center justify-between border-t border-indigo-500 pt-5 text-sm">
                                    <p>Safe & Secure Transactions</p>
                                    <p className="text-xs text-indigo-200">
                                        Last updated:{" "}
                                        {new Date(
                                            wallet?.updatedAt,
                                        ).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Total Earned
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-950">
                                        {wallet?.totalEarned?.toLocaleString() ||
                                            0}{" "}
                                        <span className="text-lg text-slate-600 text-sm">
                                            VND
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        User Model
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-950">
                                        {wallet?.userModel || "Instructor"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Form */}
                    <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 self-start">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                                <Landmark className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-950">
                                    Withdraw Funds
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Choose your bank and enter details.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleWithdraw} className="space-y-6">
                            {/* Input: Amount */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                                    Withdrawal Amount
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="w-full rounded-xl border border-slate-200 bg-white p-4 pl-12 pr-16 text-lg font-bold text-slate-950 focus:border-indigo-400 focus:ring-indigo-200 focus:ring-2 transition shadow-sm"
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        placeholder="Min: 50,000"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 select-none">
                                        VND
                                    </span>
                                </div>
                            </div>

                            {/* Bank Selection & Details */}
                            <div className="space-y-5 rounded-2xl bg-slate-50 p-5 border border-slate-100 relative pt-7">
                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider absolute -top-2.5 left-5 bg-white px-2">
                                    Receiving Account
                                </p>

                                {/* Select Bank */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Select Bank
                                    </label>
                                    <select
                                        className="w-full rounded-lg border border-slate-200 bg-white p-3 font-semibold text-slate-950 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 outline-none cursor-pointer"
                                        value={bankInfo.bankCode}
                                        onChange={(e) =>
                                            setBankInfo({
                                                ...bankInfo,
                                                bankCode: e.target.value,
                                            })
                                        }
                                        required
                                    >
                                        {SUPPORTED_BANKS.map((bank) => (
                                            <option
                                                key={bank.id}
                                                value={bank.id}
                                            >
                                                {bank.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-slate-950 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
                                        value={bankInfo.accountNumber}
                                        onChange={(e) =>
                                            setBankInfo({
                                                ...bankInfo,
                                                accountNumber: e.target.value,
                                            })
                                        }
                                        placeholder="Enter account number"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Account Holder Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-slate-200 bg-white p-3 pl-9 font-semibold text-slate-950 uppercase focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
                                            value={bankInfo.accountName}
                                            onChange={(e) =>
                                                setBankInfo({
                                                    ...bankInfo,
                                                    accountName: e.target.value,
                                                })
                                            }
                                            placeholder="NGUYEN VAN A"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 border border-amber-100">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <p>
                                    Ensure all details match your bank record to
                                    avoid transaction failures.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full overflow-hidden rounded-2xl bg-indigo-600 px-6 py-4 text-center font-bold text-white shadow-xl transition-all hover:bg-indigo-700 disabled:opacity-60"
                            >
                                <div
                                    className={`flex items-center justify-center gap-2 ${loading ? "opacity-0" : "opacity-100"}`}
                                >
                                    <span>Submit Withdrawal Request</span>
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </div>
                                {loading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                    </div>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
