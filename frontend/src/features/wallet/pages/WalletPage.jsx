import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
    Landmark,
    Wallet,
    History,
    AlertTriangle,
    Sparkles,
    ShieldCheck,
    CircleDollarSign,
    CreditCard,
    BadgeCheck,
} from "lucide-react";
import walletService from "../services/wallet.service";

const SOCKET_URL = "http://localhost:4000";

const SUPPORTED_BANKS = [
    { id: "TPB", name: "TPBank" },
    { id: "VCB", name: "Vietcombank" },
    { id: "MB", name: "MBBank" },
    { id: "TCB", name: "Techcombank" },
    { id: "ICB", name: "VietinBank" },
    { id: "ACB", name: "ACB" },
    { id: "VPB", name: "VPBank" },
];

function formatCurrencyInput(value) {
    if (!value) return "";
    const numeric = String(value).replace(/\D/g, "");
    if (!numeric) return "";
    return Number(numeric).toLocaleString("en-US");
}

function parseCurrencyInput(value) {
    return Number(String(value || "").replace(/\D/g, "")) || 0;
}

function sanitizeAccountNumber(value) {
    return String(value || "").replace(/\D/g, "");
}

function sanitizeAccountName(value) {
    return String(value || "")
        .replace(/[^a-zA-ZÀ-ỹ\s]/g, "")
        .replace(/\s{2,}/g, " ")
        .trimStart();
}

function formatDisplayMoney(value) {
    return Number(value || 0).toLocaleString("en-US");
}

function formatDateTime(value) {
    if (!value) return "--";
    return new Date(value).toLocaleString();
}

function CountUpValue({ value = 0 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const previousValueRef = useRef(0);

    useEffect(() => {
        const start = previousValueRef.current;
        const end = Number(value || 0);
        const duration = 700;
        const startTime = performance.now();

        const animate = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const next = Math.round(start + (end - start) * eased);
            setDisplayValue(next);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                previousValueRef.current = end;
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return <>{formatDisplayMoney(displayValue)}</>;
}

const WalletPage = () => {
    const [wallet, setWallet] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [amountInput, setAmountInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [bankInfo, setBankInfo] = useState({
        bankCode: "TPB",
        accountNumber: "",
        accountName: "",
    });

    const navigate = useNavigate();
    const socketRef = useRef(null);

    const balance = Number(wallet?.balance || 0);
    const totalEarned = Number(wallet?.totalEarned || 0);
    const amountValue = parseCurrencyInput(amountInput);

    const amountError = useMemo(() => {
        if (!amountInput) return "";
        if (amountValue < 50000)
            return "Minimum withdrawal amount is 50,000 VND";
        if (amountValue > balance)
            return "Withdrawal amount exceeds your available balance";
        return "";
    }, [amountInput, amountValue, balance]);

    const accountNumberError = useMemo(() => {
        if (!bankInfo.accountNumber) return "";
        if (bankInfo.accountNumber.length < 6)
            return "Account number looks too short";
        return "";
    }, [bankInfo.accountNumber]);

    const accountNameError = useMemo(() => {
        if (!bankInfo.accountName) return "";
        if (bankInfo.accountName.trim().length < 2)
            return "Account holder name is too short";
        return "";
    }, [bankInfo.accountName]);

    const canSendOtp =
        amountValue >= 50000 &&
        amountValue <= balance &&
        Boolean(bankInfo.accountNumber) &&
        Boolean(bankInfo.accountName) &&
        !amountError &&
        !accountNumberError &&
        !accountNameError;

    const loadWallet = async () => {
        try {
            const res = await walletService.getMyWallet();
            if (res?.data) {
                setWallet(res.data);
            }
        } catch (error) {
            toast.error("Cannot load wallet information. Please try again.");
        }
    };

    const loadWithdrawals = async () => {
        try {
            setHistoryLoading(true);
            const res = await walletService.getMyWithdrawals();
            setWithdrawals(res?.data || []);
        } catch (error) {
            toast.error("Cannot load withdrawal history.");
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setFetching(true);
                await Promise.all([loadWallet(), loadWithdrawals()]);
            } finally {
                setFetching(false);
            }
        };

        bootstrap();
    }, []);

    useEffect(() => {
        if (resendCountdown <= 0) return;

        const timer = setInterval(() => {
            setResendCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCountdown]);

    useEffect(() => {
        const token =
            localStorage.getItem("accessToken") || localStorage.getItem("token");

        if (!token) return undefined;

        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: {
                token,
            },
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Wallet realtime connected");
        });

        socket.on("wallet:updated", async (payload) => {
            if (payload?.wallet) {
                setWallet(payload.wallet);
            } else {
                await loadWallet();
            }

            if (payload?.withdrawal?._id) {
                setWithdrawals((prev) => {
                    const current = Array.isArray(prev) ? prev : [];
                    const found = current.some(
                        (item) => item._id === payload.withdrawal._id,
                    );

                    if (!found) {
                        return [payload.withdrawal, ...current];
                    }

                    return current.map((item) =>
                        item._id === payload.withdrawal._id
                            ? { ...item, ...payload.withdrawal }
                            : item,
                    );
                });
            } else {
                await loadWithdrawals();
            }

            if (payload?.message) {
                if (payload?.status === "completed") {
                    toast.success(payload.message);
                } else if (payload?.status === "rejected") {
                    toast.warning(payload.message);
                } else {
                    toast.info(payload.message);
                }
            } else if (payload?.status === "completed") {
                toast.success(
                    "Withdrawal approved. Your wallet has been updated.",
                );
            } else if (payload?.status === "rejected") {
                toast.warning("Withdrawal request was rejected by admin.");
            }
        });

        socket.on("disconnect", () => {
            console.log("Wallet realtime disconnected");
        });

        return () => {
            socket.off("wallet:updated");
            socket.disconnect();
        };
    }, []);

    const buildWithdrawBody = () => {
        const selectedBank = SUPPORTED_BANKS.find(
            (b) => b.id === bankInfo.bankCode,
        );

        return {
            amount: amountValue,
            bankInfo: {
                bankCode: bankInfo.bankCode,
                bankName: selectedBank ? selectedBank.name : "Unknown Bank",
                accountNumber: bankInfo.accountNumber,
                accountName: bankInfo.accountName.toUpperCase().trim(),
            },
        };
    };

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setAmountInput(formatCurrencyInput(raw));
    };

    const handleAccountNumberChange = (e) => {
        setBankInfo((prev) => ({
            ...prev,
            accountNumber: sanitizeAccountNumber(e.target.value),
        }));
    };

    const handleAccountNameChange = (e) => {
        setBankInfo((prev) => ({
            ...prev,
            accountName: sanitizeAccountName(e.target.value).toUpperCase(),
        }));
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();

        if (!canSendOtp) {
            return toast.warning(
                amountError ||
                    accountNumberError ||
                    accountNameError ||
                    "Please complete valid withdrawal information",
            );
        }

        try {
            setLoading(true);

            const body = buildWithdrawBody();
            const res = await walletService.requestWithdrawalOtp(body);

            toast.success(res.message || "OTP has been sent to your email");
            setOtpSent(true);
            setOtp("");
            setResendCountdown(res.retryAfter || 60);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message ||
                error.data?.message ||
                error.message ||
                "An error occurred while sending OTP";

            const retryAfter =
                error.response?.data?.retryAfter || error.data?.retryAfter;

            if (retryAfter) {
                setResendCountdown(retryAfter);
            }

            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            return toast.warning("Please enter a valid 6-digit OTP");
        }

        try {
            setLoading(true);

            const res = await walletService.verifyWithdrawalOtp({ otp });
            const createdWithdrawal = res?.data || null;

            toast.success(
                res.message || "Withdrawal request submitted successfully!",
            );

            if (createdWithdrawal?._id) {
                setWithdrawals((prev) => [createdWithdrawal, ...(prev || [])]);
            } else {
                await loadWithdrawals();
            }

            setAmountInput("");
            setOtp("");
            setOtpSent(false);
            setResendCountdown(0);
            setBankInfo({
                bankCode: "TPB",
                accountNumber: "",
                accountName: "",
            });
        } catch (error) {
            const errorMsg =
                error.response?.data?.message ||
                error.data?.message ||
                error.message ||
                "An error occurred while verifying OTP";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                    <p className="font-medium text-slate-600">
                        Loading your wallet...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff_40%,_#f8fafc)] px-4 py-8 md:px-6 md:py-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700 shadow-sm backdrop-blur">
                            <Sparkles className="h-3.5 w-3.5" />
                            Premium Wallet
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tighter text-slate-950 md:text-5xl">
                            My Wallet Center
                        </h1>

                        <p className="mt-2 max-w-2xl text-slate-600">
                            Manage your balance, earnings, and withdrawal requests
                            with a smooth, secure, and modern payout workflow.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/transactions")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]"
                    >
                        <History className="h-4 w-4" />
                        View Transaction History
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_0.9fr]">
                    <div className="space-y-8">
                        <div className="relative overflow-hidden rounded-[32px] border border-white/30 bg-[linear-gradient(135deg,#4f46e5_0%,#5b4df5_28%,#4338ca_70%,#3730a3_100%)] p-8 text-white shadow-[0_30px_80px_rgba(79,70,229,0.28)]">
                            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
                            <div className="absolute right-10 top-10 h-24 w-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl" />
                            <div className="absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-indigo-900/30 blur-2xl" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_25%)]" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl">
                                            <Wallet className="h-7 w-7 text-indigo-50" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-100/90">
                                                Available Balance
                                            </p>
                                            <h2 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                                                <CountUpValue value={balance} />
                                                <span className="ml-2 text-lg font-bold text-indigo-100/90">
                                                    VND
                                                </span>
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right backdrop-blur-xl">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100/80">
                                            Lifetime Earned
                                        </p>
                                        <p className="mt-1 text-lg font-extrabold">
                                            {formatDisplayMoney(totalEarned)} VND
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                                            <CircleDollarSign className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100/80">
                                            Current Balance
                                        </p>
                                        <p className="mt-2 text-xl font-black">
                                            {formatDisplayMoney(balance)} VND
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100/80">
                                            Minimum Withdraw
                                        </p>
                                        <p className="mt-2 text-xl font-black">
                                            50,000 VND
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                                            <BadgeCheck className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100/80">
                                            Security Layer
                                        </p>
                                        <p className="mt-2 text-xl font-black">
                                            Email OTP
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                            <div className="border-b border-slate-100 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <Landmark className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-900">
                                            Withdrawal Request
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Submit payout requests safely with OTP
                                            verification.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form
                                onSubmit={handleWithdraw}
                                className="space-y-6 px-6 py-6"
                            >
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Withdrawal Amount
                                        </label>
                                        <input
                                            type="text"
                                            value={amountInput}
                                            onChange={handleAmountChange}
                                            placeholder="Enter amount in VND"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                        />
                                        {amountError ? (
                                            <p className="mt-2 text-xs font-medium text-rose-500">
                                                {amountError}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Bank
                                        </label>
                                        <select
                                            value={bankInfo.bankCode}
                                            onChange={(e) =>
                                                setBankInfo((prev) => ({
                                                    ...prev,
                                                    bankCode: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
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
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Account Number
                                        </label>
                                        <input
                                            type="text"
                                            value={bankInfo.accountNumber}
                                            onChange={handleAccountNumberChange}
                                            placeholder="Enter bank account number"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                        />
                                        {accountNumberError ? (
                                            <p className="mt-2 text-xs font-medium text-rose-500">
                                                {accountNumberError}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Account Holder Name
                                        </label>
                                        <input
                                            type="text"
                                            value={bankInfo.accountName}
                                            onChange={handleAccountNameChange}
                                            placeholder="Enter account holder name"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold uppercase text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                        />
                                        {accountNameError ? (
                                            <p className="mt-2 text-xs font-medium text-rose-500">
                                                {accountNameError}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                {!otpSent ? (
                                    <button
                                        type="submit"
                                        disabled={loading || !canSendOtp}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        {loading ? "Sending OTP..." : "Send OTP"}
                                    </button>
                                ) : (
                                    <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                                            <div>
                                                <p className="font-bold text-amber-900">
                                                    Enter OTP Verification
                                                </p>
                                                <p className="mt-1 text-sm text-amber-700">
                                                    We sent a 6-digit OTP to your
                                                    email. Please verify to submit
                                                    your withdrawal request.
                                                </p>
                                            </div>
                                        </div>

                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) =>
                                                setOtp(
                                                    e.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 6),
                                                )
                                            }
                                            placeholder="Enter 6-digit OTP"
                                            className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-center text-lg font-extrabold tracking-[0.35em] text-slate-900 outline-none transition focus:ring-4 focus:ring-amber-100"
                                        />

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={handleVerifyOtp}
                                                disabled={loading || otp.length !== 6}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {loading
                                                    ? "Verifying..."
                                                    : "Verify & Submit"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleWithdraw}
                                                disabled={loading || resendCountdown > 0}
                                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {resendCountdown > 0
                                                    ? `Resend in ${resendCountdown}s`
                                                    : "Resend OTP"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                            <div className="border-b border-slate-100 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                        <History className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-900">
                                            Withdrawal History
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Track every payout request and admin
                                            response.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-[680px] overflow-y-auto px-6 py-5">
                                {historyLoading ? (
                                    <div className="py-8 text-center text-sm text-slate-400">
                                        Loading withdrawal history...
                                    </div>
                                ) : withdrawals.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                                        <p className="font-semibold text-slate-700">
                                            No withdrawal requests yet
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Your latest withdrawal requests will
                                            appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {withdrawals.map((item) => {
                                            const isPending =
                                                item.status === "pending";
                                            const isCompleted =
                                                item.status === "completed";
                                            const isRejected =
                                                item.status === "rejected";

                                            return (
                                                <div
                                                    key={item._id}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="text-lg font-extrabold text-slate-900">
                                                                {formatDisplayMoney(
                                                                    item.amount,
                                                                )}{" "}
                                                                VND
                                                            </div>
                                                            <div className="mt-1 text-sm text-slate-500">
                                                                {item.bankInfo?.bankName}{" "}
                                                                -{" "}
                                                                {
                                                                    item.bankInfo
                                                                        ?.accountNumber
                                                                }
                                                            </div>
                                                        </div>

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                                                isPending
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : isCompleted
                                                                      ? "bg-emerald-100 text-emerald-700"
                                                                      : "bg-rose-100 text-rose-700"
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600">
                                                        <div>
                                                            <span className="font-semibold text-slate-800">
                                                                Created:
                                                            </span>{" "}
                                                            {formatDateTime(
                                                                item.createdAt,
                                                            )}
                                                        </div>

                                                        <div>
                                                            <span className="font-semibold text-slate-800">
                                                                Processed:
                                                            </span>{" "}
                                                            {formatDateTime(
                                                                item.processedAt,
                                                            )}
                                                        </div>

                                                        {isRejected &&
                                                        item.adminNote ? (
                                                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
                                                                <span className="font-bold">
                                                                    Reject reason:
                                                                </span>{" "}
                                                                {item.adminNote}
                                                            </div>
                                                        ) : null}

                                                        {isCompleted &&
                                                        item.adminNote ? (
                                                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
                                                                <span className="font-bold">
                                                                    Admin note:
                                                                </span>{" "}
                                                                {item.adminNote}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;