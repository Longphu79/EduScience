import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap justify-end gap-3 px-6 py-5">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}