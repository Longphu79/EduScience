import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    Search,
    ExternalLink,
    Landmark,
} from "lucide-react";
import * as adminService from "../services/admin.service";

const AdminWithdrawalsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filterStatus, setFilterStatus] = useState("pending");

    // State mới cho việc từ chối (Reject)
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [rejectingId, setRejectingId] = useState(null);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAdminWithdrawals({
                status: filterStatus,
            });
            // Kiểm tra cấu trúc data trả về từ adminUnwrap
            setRequests(res?.items || res || []);
        } catch (error) {
            console.error("Failed to load withdrawal requests:", error);
            toast.error("Không thể tải danh sách rút tiền");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [filterStatus]);

    // Hàm xử lý chung (Duyệt hoặc Từ chối)
    const handleAction = async (id, status, note = "") => {
        try {
            await adminService.processAdminWithdrawal(id, {
                status: status,
                adminNote: note,
            });

            toast.success(
                status === "completed" ? "Đã duyệt thành công" : "Đã từ chối",
            );

            setSelectedRequest(null);
            setShowRejectModal(false);
            setRejectNote("");
            await loadRequests();
        } catch (error) {
            console.error("Failed to process withdrawal request:", error);
            const msg = error.response?.data?.message || "Thao tác thất bại";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Withdrawal Requests
                        </h1>
                        <p className="text-slate-500">
                            Review and process payouts securely.
                        </p>
                    </div>

                    <div className="flex rounded-xl bg-white p-1 shadow-sm border text-sm font-bold capitalize">
                        {["pending", "completed", "rejected"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    filterStatus === s
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 uppercase text-xs font-bold text-slate-500">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Bank Info</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-10 text-center text-slate-400"
                                    >
                                        Loading requests...
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-10 text-center text-slate-400"
                                    >
                                        No requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr
                                        key={req._id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={req.userAvatar}
                                                    alt="avatar"
                                                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                                                />
                                                <div className="min-w-0">
                                                    <div className="truncate font-bold text-slate-900">
                                                        {req.userName}{" "}
                                                        {/* Nó sẽ hiện fullName hoặc username */}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {req.userEmail}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono font-bold text-indigo-600">
                                                {req.amount?.toLocaleString()}{" "}
                                                VND
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-semibold">
                                                {req.bankInfo.bankName}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono">
                                                {req.bankInfo.accountNumber}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(
                                                req.createdAt,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            {req.status === "pending" ? (
                                                <button
                                                    onClick={() =>
                                                        setSelectedRequest(req)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />{" "}
                                                    Process
                                                </button>
                                            ) : (
                                                <span
                                                    className={`text-xs font-bold uppercase px-2 py-1 rounded ${req.status === "completed" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}
                                                >
                                                    {req.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Duyệt & Hiện QR */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">
                                Payout Details
                            </h3>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mb-6 space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">
                                    Recipient:
                                </span>
                                <span className="font-bold text-slate-900">
                                    {selectedRequest.bankInfo.accountName}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Amount:</span>
                                <span className="font-bold text-indigo-600">
                                    {selectedRequest.amount?.toLocaleString()}{" "}
                                    VND
                                </span>
                            </div>
                        </div>

                        <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 bg-white">
                            <p className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Scan to Pay (VietQR)
                            </p>
                            <img
                                src={selectedRequest.vietQrUrl}
                                alt="VietQR"
                                className="h-48 w-48 rounded-lg shadow-md"
                            />
                            <p className="mt-4 text-[10px] text-slate-400 text-center px-4 uppercase font-bold tracking-wider">
                                {selectedRequest.bankInfo.bankName} -{" "}
                                {selectedRequest.bankInfo.accountNumber}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setRejectingId(selectedRequest._id);
                                    setShowRejectModal(true);
                                }}
                                className="rounded-xl border border-red-200 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
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
                                className="rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 shadow-lg"
                            >
                                Confirm Paid
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REJECT MODAL (THAY THẾ PROMPT) */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-red-600 mb-4">
                            Lý do từ chối rút tiền
                        </h3>
                        <textarea
                            className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:ring-2 focus:ring-red-100 outline-none min-h-[120px] transition-all"
                            placeholder="Nhập lý do tại đây..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectNote("");
                                }}
                                className="rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() =>
                                    handleAction(
                                        rejectingId,
                                        "rejected",
                                        rejectNote,
                                    )
                                }
                                className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 shadow-lg"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWithdrawalsPage;
