import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import {
    XCircle,
    Eye,
    User,
    Mail,
    Landmark,
    Wallet,
    Clock3,
    BadgeInfo,
    IdCard,
    ChevronRight,
    ShieldCheck,
    Sparkles,
    Search,
    ExternalLink,
    CircleDollarSign,
    Building2,
    CalendarDays,
    FileText,
    CheckCircle2,
    XOctagon,
    Hourglass,
} from "lucide-react";
import * as adminService from "../services/admin.service";

const SOCKET_URL = "http://localhost:4000";

function formatDateTime(value) {
    if (!value) return "--";
    return new Date(value).toLocaleString();
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString("en-US");
}

function getStatusMeta(status) {
    switch (status) {
        case "completed":
            return {
                label: "Completed",
                className:
                    "bg-emerald-50 text-emerald-700 border border-emerald-200",
                icon: CheckCircle2,
            };
        case "rejected":
            return {
                label: "Rejected",
                className: "bg-rose-50 text-rose-700 border border-rose-200",
                icon: XOctagon,
            };
        case "pending":
        default:
            return {
                label: "Pending",
                className:
                    "bg-amber-50 text-amber-700 border border-amber-200",
                icon: Hourglass,
            };
    }
}

function StatCard({ icon: Icon, label, value, subtle }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {label}
                    </p>
                    <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                        {value}
                    </p>
                    {subtle ? (
                        <p className="mt-2 text-sm text-slate-500">{subtle}</p>
                    ) : null}
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function SectionLabel({ children }) {
    return (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            {children}
        </div>
    );
}

const AdminWithdrawalsPage = () => {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedUserRequest, setSelectedUserRequest] = useState(null);
    const [filterStatus, setFilterStatus] = useState("pending");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [rejectingId, setRejectingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const socketRef = useRef(null);

    const loadRequests = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);

            const res = await adminService.getAdminWithdrawals({
                status: filterStatus,
            });

            setRequests(res?.items || res || []);
        } catch (error) {
            console.error("Failed to load withdrawal requests:", error);
            toast.error("Không thể tải danh sách rút tiền");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [filterStatus]);

    useEffect(() => {
        const token =
            localStorage.getItem("accessToken") || localStorage.getItem("token");

        if (!token) return undefined;

        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token },
        });

        socketRef.current = socket;

        const handleCreated = (payload) => {
            const incoming = payload?.withdrawal;
            if (!incoming?._id) return;

            if (filterStatus === "pending") {
                setRequests((prev) => {
                    const next = Array.isArray(prev) ? [...prev] : [];
                    const exists = next.some((item) => item._id === incoming._id);
                    if (exists) return prev;
                    return [incoming, ...next];
                });
            }

            toast.info(payload?.message || "Có yêu cầu rút tiền mới");
        };

        const handleUpdated = (payload) => {
            const updated = payload?.withdrawal;
            if (!updated?._id) return;

            setRequests((prev) => {
                const current = Array.isArray(prev) ? prev : [];

                if (filterStatus === "pending" && updated.status !== "pending") {
                    return current.filter((item) => item._id !== updated._id);
                }

                const found = current.some((item) => item._id === updated._id);
                if (!found) {
                    if (filterStatus === updated.status) {
                        return [updated, ...current];
                    }
                    return current;
                }

                return current.map((item) =>
                    item._id === updated._id ? { ...item, ...updated } : item,
                );
            });

            setSelectedUserRequest((prev) =>
                prev?._id === updated._id ? { ...prev, ...updated } : prev,
            );

            setSelectedRequest((prev) =>
                prev?._id === updated._id ? { ...prev, ...updated } : prev,
            );
        };

        socket.on("withdrawal:created", handleCreated);
        socket.on("withdrawal:updated", handleUpdated);

        return () => {
            socket.off("withdrawal:created", handleCreated);
            socket.off("withdrawal:updated", handleUpdated);
            socket.disconnect();
        };
    }, [filterStatus]);

    const handleAction = async (id, status, note = "") => {
        try {
            const res = await adminService.processAdminWithdrawal(id, {
                status,
                adminNote: note,
            });

            const updatedWithdrawal = res?.data || res;

            toast.success(
                status === "completed" ? "Đã duyệt thành công" : "Đã từ chối",
            );

            setSelectedRequest(null);
            setShowRejectModal(false);
            setRejectNote("");
            setRejectingId(null);

            setSelectedUserRequest((prev) =>
                prev?._id === id ? { ...prev, ...updatedWithdrawal } : prev,
            );

            setRequests((prev) => {
                const current = Array.isArray(prev) ? prev : [];

                if (filterStatus === "pending") {
                    return current.filter((item) => item._id !== id);
                }

                return current.map((item) =>
                    item._id === id ? { ...item, ...updatedWithdrawal } : item,
                );
            });

            if (filterStatus !== "pending") {
                await loadRequests({ silent: true });
            }
        } catch (error) {
            console.error("Failed to process withdrawal request:", error);
            const msg = error.response?.data?.message || "Thao tác thất bại";
            toast.error(msg);
        }
    };

    const filteredRequests = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return requests;

        return requests.filter((req) => {
            const haystack = [
                req.userName,
                req.userEmail,
                req.bankInfo?.bankName,
                req.bankInfo?.accountNumber,
                req.bankInfo?.accountName,
                req.status,
                String(req.amount || ""),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(keyword);
        });
    }, [requests, searchTerm]);

    const summary = useMemo(() => {
        const total = requests.length;
        const totalAmount = requests.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0,
        );
        const pendingCount = requests.filter(
            (item) => item.status === "pending",
        ).length;

        return {
            total,
            totalAmount,
            pendingCount,
        };
    }, [requests]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff_45%,_#f8fafc)] px-4 py-8 md:px-6 md:py-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
                    <div>
                        <SectionLabel>Admin payout center</SectionLabel>
                        <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                            Withdrawal Requests
                        </h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                            Review payout requests with a polished admin workflow,
                            realtime updates, detailed requester information, and
                            a cleaner approval experience.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search user, bank, amount..."
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 sm:w-[280px]"
                            />
                        </div>

                        <div className="flex rounded-2xl border border-slate-200 bg-white p-1 text-sm font-bold capitalize shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                            {["pending", "completed", "rejected"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`rounded-xl px-5 py-3 transition-all ${
                                        filterStatus === s
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                            : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatCard
                        icon={FileText}
                        label="Requests in current view"
                        value={summary.total}
                        subtle="Filtered by selected status tab"
                    />
                    <StatCard
                        icon={CircleDollarSign}
                        label="Total amount"
                        value={`${formatMoney(summary.totalAmount)} VND`}
                        subtle="Visible requests total"
                    />
                    <StatCard
                        icon={ShieldCheck}
                        label="Pending now"
                        value={summary.pendingCount}
                        subtle="Awaiting payout action"
                    />
                </div>

                <div className="overflow-hidden rounded-[30px] border border-white/50 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-950">
                                    Payout Review Queue
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Click a user to inspect details, then approve
                                    or reject from the payout modal.
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                <Sparkles className="h-3.5 w-3.5" />
                                Live updates enabled
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-slate-50/80 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Bank Info</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-16 text-center text-sm font-medium text-slate-400"
                                        >
                                            Loading requests...
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="mx-auto max-w-md">
                                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                                    <Search className="h-5 w-5" />
                                                </div>
                                                <p className="text-lg font-bold text-slate-800">
                                                    No matching requests found
                                                </p>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Try changing the status tab or
                                                    search keyword.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => {
                                        const statusMeta = getStatusMeta(req.status);
                                        const StatusIcon = statusMeta.icon;

                                        return (
                                            <tr
                                                key={req._id}
                                                className="group transition-colors hover:bg-indigo-50/30"
                                            >
                                                <td className="px-6 py-5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedUserRequest(
                                                                req,
                                                            )
                                                        }
                                                        className="flex items-center gap-4 text-left transition hover:opacity-90"
                                                    >
                                                        <div className="relative">
                                                            <img
                                                                src={req.userAvatar}
                                                                alt="avatar"
                                                                className="h-12 w-12 rounded-2xl border border-slate-200 object-cover shadow-sm"
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 rounded-full border border-white bg-white p-1 shadow-sm">
                                                                <User className="h-3 w-3 text-slate-500" />
                                                            </div>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="truncate text-base font-extrabold text-slate-950">
                                                                {req.userName}
                                                            </div>
                                                            <div className="mt-1 truncate text-sm text-slate-500">
                                                                {req.userEmail}
                                                            </div>
                                                        </div>
                                                    </button>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="text-lg font-black tracking-tight text-indigo-600">
                                                        {formatMoney(req.amount)}{" "}
                                                        <span className="text-sm font-bold text-indigo-500">
                                                            VND
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="space-y-1">
                                                        <div className="font-bold text-slate-900">
                                                            {req.bankInfo?.bankName}
                                                        </div>
                                                        <div className="font-mono text-sm text-slate-500">
                                                            {req.bankInfo?.accountNumber}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="text-sm font-semibold text-slate-700">
                                                        {new Date(
                                                            req.createdAt,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-400">
                                                        {formatDateTime(
                                                            req.createdAt,
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide ${statusMeta.className}`}
                                                    >
                                                        <StatusIcon className="h-3.5 w-3.5" />
                                                        {statusMeta.label}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedUserRequest(
                                                                    req,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                                                        >
                                                            <User className="h-3.5 w-3.5" />
                                                            User
                                                        </button>

                                                        {req.status === "pending" ? (
                                                            <button
                                                                onClick={() =>
                                                                    setSelectedRequest(
                                                                        req,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-800"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                                Process
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedUserRequest(
                                                                        req,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                                            >
                                                                Details
                                                                <ChevronRight className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedUserRequest ? (
                <div className="fixed inset-0 z-[105] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
                    <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.30)]">
                        <div className="relative overflow-hidden border-b border-slate-100 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#312e81_100%)] px-6 py-6 text-white">
                            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />

                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selectedUserRequest.userAvatar}
                                        alt="avatar"
                                        className="h-16 w-16 rounded-2xl border border-white/20 object-cover shadow-xl"
                                    />
                                    <div className="min-w-0">
                                        <div className="text-2xl font-black tracking-tight">
                                            {selectedUserRequest.userName || "N/A"}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-200">
                                            <Mail className="h-4 w-4" />
                                            <span className="truncate">
                                                {selectedUserRequest.userEmail ||
                                                    "N/A"}
                                            </span>
                                        </div>
                                        <div className="mt-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-indigo-100">
                                            {selectedUserRequest.userModel || "User"}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedUserRequest(null)}
                                    className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                                >
                                    <XCircle className="h-7 w-7" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[calc(92vh-112px)] overflow-y-auto p-6">
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <StatCard
                                    icon={Wallet}
                                    label="Request amount"
                                    value={`${formatMoney(
                                        selectedUserRequest.amount,
                                    )} VND`}
                                />
                                <StatCard
                                    icon={Building2}
                                    label="Bank"
                                    value={selectedUserRequest.bankInfo?.bankName || "N/A"}
                                />
                                <StatCard
                                    icon={BadgeInfo}
                                    label="Status"
                                    value={getStatusMeta(selectedUserRequest.status).label}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                                <div className="space-y-6">
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <h3 className="mb-4 text-lg font-extrabold text-slate-900">
                                            User Information
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <User className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Full Name
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-600">
                                                    {selectedUserRequest.userName ||
                                                        "N/A"}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Email
                                                    </span>
                                                </div>
                                                <div className="break-all text-sm font-semibold text-slate-600">
                                                    {selectedUserRequest.userEmail ||
                                                        "N/A"}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <IdCard className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        User ID
                                                    </span>
                                                </div>
                                                <div className="break-all font-mono text-sm text-slate-600">
                                                    {selectedUserRequest.userId?._id ||
                                                        selectedUserRequest.userId ||
                                                        "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <h3 className="mb-4 text-lg font-extrabold text-slate-900">
                                            Bank Information
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <Landmark className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Bank Name
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-600">
                                                    {selectedUserRequest.bankInfo?.bankName ||
                                                        "N/A"}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <Building2 className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Bank Code
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-600">
                                                    {selectedUserRequest.bankInfo?.bankCode ||
                                                        "N/A"}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <Wallet className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Account Number
                                                    </span>
                                                </div>
                                                <div className="font-mono text-sm font-semibold text-slate-600">
                                                    {selectedUserRequest.bankInfo
                                                        ?.accountNumber || "N/A"}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <User className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Account Name
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-600">
                                                    {selectedUserRequest.bankInfo
                                                        ?.accountName || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <h3 className="mb-4 text-lg font-extrabold text-slate-900">
                                            Request Timeline
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <CalendarDays className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Created At
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-600">
                                                    {formatDateTime(
                                                        selectedUserRequest.createdAt,
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <Clock3 className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Processed At
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-600">
                                                    {formatDateTime(
                                                        selectedUserRequest.processedAt,
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <BadgeInfo className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Status
                                                    </span>
                                                </div>

                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide ${getStatusMeta(selectedUserRequest.status).className}`}
                                                >
                                                    {React.createElement(
                                                        getStatusMeta(
                                                            selectedUserRequest.status,
                                                        ).icon,
                                                        { className: "h-3.5 w-3.5" },
                                                    )}
                                                    {
                                                        getStatusMeta(
                                                            selectedUserRequest.status,
                                                        ).label
                                                    }
                                                </span>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2 text-slate-800">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Admin Note
                                                    </span>
                                                </div>
                                                <div className="text-sm leading-6 text-slate-600">
                                                    {selectedUserRequest.adminNote ||
                                                        "--"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <h3 className="mb-4 text-lg font-extrabold text-slate-900">
                                            Quick Actions
                                        </h3>

                                        <div className="space-y-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const userId =
                                                        selectedUserRequest.userId?._id ||
                                                        selectedUserRequest.userId;

                                                    if (!userId) {
                                                        toast.error(
                                                            "Không tìm thấy userId",
                                                        );
                                                        return;
                                                    }

                                                    navigate(`/admin/users/${userId}`);
                                                }}
                                                className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    <ExternalLink className="h-4 w-4" />
                                                    View full profile
                                                </span>
                                                <ChevronRight className="h-4 w-4" />
                                            </button>

                                            {selectedUserRequest.status ===
                                            "pending" ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedRequest(
                                                                selectedUserRequest,
                                                            );
                                                            setSelectedUserRequest(
                                                                null,
                                                            );
                                                        }}
                                                        className="inline-flex w-full items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-800"
                                                    >
                                                        <span className="inline-flex items-center gap-2">
                                                            <Eye className="h-4 w-4" />
                                                            Open process modal
                                                        </span>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRejectingId(
                                                                selectedUserRequest._id,
                                                            );
                                                            setShowRejectModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="inline-flex w-full items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                                                    >
                                                        <span className="inline-flex items-center gap-2">
                                                            <XOctagon className="h-4 w-4" />
                                                            Reject request
                                                        </span>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : null}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedUserRequest(null)
                                                }
                                                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {selectedRequest ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.30)]">
                        <div className="border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black">
                                        Payout Details
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-300">
                                        Confirm payment after bank transfer
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Recipient
                                        </span>
                                        <span className="text-right font-bold text-slate-900">
                                            {selectedRequest.bankInfo?.accountName}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Amount
                                        </span>
                                        <span className="font-black text-indigo-600">
                                            {formatMoney(selectedRequest.amount)}{" "}
                                            VND
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Bank
                                        </span>
                                        <span className="font-semibold text-slate-800">
                                            {selectedRequest.bankInfo?.bankName}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
                                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                                    Scan to pay (vietqr)
                                </p>

                                <img
                                    src={selectedRequest.vietQrUrl}
                                    alt="VietQR"
                                    className="h-52 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-md"
                                />

                                <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                    {selectedRequest.bankInfo?.bankName} -{" "}
                                    {selectedRequest.bankInfo?.accountNumber}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        setRejectingId(selectedRequest._id);
                                        setShowRejectModal(true);
                                    }}
                                    className="rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100"
                                >
                                    Reject Request
                                </button>

                                <button
                                    onClick={() =>
                                        handleAction(
                                            selectedRequest._id,
                                            "completed",
                                        )
                                    }
                                    className="rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700"
                                >
                                    Confirm Paid
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {showRejectModal ? (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md rounded-[28px] border border-white/20 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.30)]">
                        <div className="mb-5">
                            <h3 className="text-xl font-black text-rose-600">
                                Reject withdrawal request
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Provide a clear reason so the instructor can see
                                exactly why the request was rejected.
                            </p>
                        </div>

                        <textarea
                            className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
                            placeholder="Nhập lý do từ chối tại đây..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectNote("");
                                    setRejectingId(null);
                                }}
                                className="rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() =>
                                    handleAction(
                                        rejectingId,
                                        "rejected",
                                        rejectNote,
                                    )
                                }
                                className="rounded-2xl bg-rose-600 py-3 text-sm font-black text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default AdminWithdrawalsPage;