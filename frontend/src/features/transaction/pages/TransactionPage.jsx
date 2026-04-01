import { useEffect, useState } from "react";
import transactionService from "../services/transaction.service";
import Toast from "../../../shared/components/Toast";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const transactionConfigs = {
    deposit: {
        label: "Deposit",
        icon: "💰",
        iconBg: "bg-emerald-100",
        textColor: "text-emerald-600",
        prefix: "+",
    },
    withdrawal: {
        label: "Withdrawal",
        icon: "🏦",
        iconBg: "bg-amber-100",
        textColor: "text-amber-600",
        prefix: "-",
    },
    payment: {
        label: "Payment",
        icon: "📚",
        iconBg: "bg-sky-100",
        textColor: "text-sky-600",
        prefix: "-",
    },
    refund: {
        label: "Refund",
        icon: "🔄",
        iconBg: "bg-slate-100",
        textColor: "text-slate-600",
        prefix: "+",
    },
};

export default function TransactionPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Quản lý thông báo bằng State thay vì gọi hàm trực tiếp
    const [toastMessage, setToastMessage] = useState("");

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const res = await transactionService.getUserTransactions({
                page: page,
                limit: 10,
                type: filterType,
            });

            const actualData = res.data || res;

            setTransactions(actualData.items || []);
            setTotalPages(actualData.pagination?.totalPages || 1);
        } catch (error) {
            console.error("Fetch transactions failed:", error);
            setToastMessage(
                "Fetch transactions failed. Please try again later.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [page, filterType]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            {/* TÍCH HỢP TOAST CỦA BẠN VÀO ĐÂY */}
            <Toast
                message={toastMessage}
                kind="error"
                onClose={() => setToastMessage("")}
            />

            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">
                            Transaction History
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            View and manage your balance fluctuations.
                        </p>
                    </div>

                    <div className="flex w-full items-center gap-2 md:w-auto">
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none ring-indigo-500 focus:ring-2"
                        >
                            <option value="">All Transactions</option>
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option>
                            <option value="payment">Payment</option>
                            <option value="refund">Refund</option>
                        </select>

                        <button
                            onClick={loadTransactions}
                            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                            🔄
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-xl bg-slate-100 animate-pulse"
                                ></div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-slate-900">
                                No transactions found
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Any transactions you make will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr className="text-xs uppercase font-bold text-slate-600">
                                        <th className="p-5 text-center">
                                            Type
                                        </th>
                                        <th className="p-5">Description</th>
                                        <th className="p-5">Reference ID</th>
                                        <th className="p-5 text-center">
                                            Date
                                        </th>
                                        <th className="p-5 text-right">
                                            Balance Before
                                        </th>
                                        <th className="p-5 text-right">
                                            Amount
                                        </th>
                                        <th className="p-5 text-right">
                                            Balance After
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((trx) => {
                                        const config =
                                            transactionConfigs[trx.type] ||
                                            transactionConfigs.refund;
                                        const absAmount = Math.abs(trx.amount);

                                        return (
                                            <tr
                                                key={trx._id}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >
                                                <td className="p-5">
                                                    <div
                                                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${config.iconBg} text-xl`}
                                                    >
                                                        {config.icon}
                                                    </div>
                                                </td>
                                                <td className="p-5 min-w-[200px]">
                                                    <div className="font-bold text-slate-900">
                                                        {config.label}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {trx.description}
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                                        {trx.referenceId?.substring(
                                                            0,
                                                            10,
                                                        )}
                                                    </code>
                                                </td>
                                                <td className="p-5 text-slate-600 text-center">
                                                    {formatDate(trx.createdAt)}
                                                </td>
                                                <td className="p-5 text-slate-600 text-right">
                                                    {formatCurrency(
                                                        trx.balanceBefore,
                                                    )}
                                                </td>
                                                <td
                                                    className={`p-5 text-right font-bold text-lg ${config.textColor}`}
                                                >
                                                    {config.prefix}{" "}
                                                    {formatCurrency(absAmount)}
                                                </td>
                                                <td className="p-5 font-semibold text-slate-900 text-right">
                                                    {formatCurrency(
                                                        trx.balanceAfter,
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-1.5">
                        <button
                            onClick={() =>
                                setPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={page === 1}
                            className="rounded-lg bg-white p-2 border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white"
                        >
                            Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`rounded-lg px-4 py-2 border ${page === i + 1 ? "bg-indigo-600 text-white border-indigo-600 font-bold" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(totalPages, prev + 1),
                                )
                            }
                            disabled={page === totalPages}
                            className="rounded-lg bg-white p-2 border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
