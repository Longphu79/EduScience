import { useEffect, useState } from "react";
import Toast from "../../../shared/components/Toast";
import * as adminService from "../services/admin.service";

export default function AdminDepositManager() {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ msg: "", kind: "success" });

    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAdminDeposits({
                status: "pending",
            });
            setDeposits(res.items || res);
        } catch (err) {
            console.error("Error fetching deposits:", err);
            setToast({
                msg: "Failed to load deposit requests",
                kind: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    const handleApprove = async (id) => {
        if (
            !window.confirm(
                "Are you sure you have received the funds in your bank account?",
            )
        )
            return;

        try {
            await adminService.approveAdminDeposit(id);
            setToast({
                msg: "Deposit approved! Funds added to user wallet.",
                kind: "success",
            });
            fetchDeposits();
        } catch (err) {
            setToast({
                msg: err.message || "Error approving deposit",
                kind: "error",
            });
        }
    };

    const handleReject = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to REJECT this deposit request?",
            )
        )
            return;
        try {
            await adminService.rejectAdminDeposit(id);
            setToast({ msg: "Deposit request rejected.", kind: "success" });
            fetchDeposits();
        } catch (err) {
            setToast({
                msg: err.message || "Error rejecting deposit",
                kind: "error",
            });
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <Toast
                message={toast.msg}
                kind={toast.kind}
                onClose={() => setToast({ ...toast, msg: "" })}
            />

            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                        Deposit Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Review and approve VietQR manual deposit requests
                    </p>
                </div>
                <button
                    onClick={fetchDeposits}
                    className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition shadow-sm font-bold text-sm flex items-center gap-2"
                >
                    🔄 Refresh
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-[11px] uppercase text-slate-400 font-bold tracking-widest">
                            <th className="p-5">User / Email</th>
                            <th className="p-5">Amount</th>
                            <th className="p-5">Ref Code</th>
                            <th className="p-5">Timestamp</th>
                            <th className="p-5 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="p-20 text-center text-slate-400"
                                >
                                    Loading data...
                                </td>
                            </tr>
                        ) : deposits.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="p-20 text-center text-slate-500 font-medium italic"
                                >
                                    No pending deposit requests found.
                                </td>
                            </tr>
                        ) : (
                            deposits.map((item) => (
                                <tr
                                    key={item._id}
                                    className="hover:bg-slate-50/50 transition"
                                >
                                    <td className="p-5">
                                        <div className="font-bold text-slate-900">
                                            {item.userId?.fullName || "N/A"}
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium">
                                            {item.userId?.email}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-black text-slate-900 text-lg">
                                            ${item.amount?.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-mono font-bold border border-indigo-100 uppercase">
                                            {item.code}
                                        </span>
                                    </td>
                                    <td className="p-5 text-xs text-slate-500 font-medium">
                                        {new Date(
                                            item.createdAt,
                                        ).toLocaleString("en-US")}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    handleApprove(item._id)
                                                }
                                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleReject(item._id)
                                                }
                                                className="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
