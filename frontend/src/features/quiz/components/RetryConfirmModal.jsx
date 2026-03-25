import React from "react";

export default function RetryConfirmModal({
  open = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-slate-950">
          Xác nhận làm lại
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Bạn đang có câu trả lời chưa nộp. Làm lại sẽ xóa toàn bộ đáp án hiện
          tại. Bạn có chắc muốn tiếp tục không?
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center rounded-[18px] bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}