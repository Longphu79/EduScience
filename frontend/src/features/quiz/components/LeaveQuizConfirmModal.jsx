import React from "react";

export default function LeaveQuizConfirmModal({
  open = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-slate-950">
          Xác nhận rời trang
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Bạn đang làm quiz. Nếu rời trang bây giờ, hệ thống sẽ kết thúc bài kiểm
          tra và tự động nộp kết quả hiện tại. Bạn có chắc muốn rời đi không?
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ở lại
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center rounded-[18px] bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Rời trang"}
          </button>
        </div>
      </div>
    </div>
  );
}