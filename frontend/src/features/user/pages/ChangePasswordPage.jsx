import Toast from "../../../shared/components/Toast";
import ChangePasswordForm from "../components/ChangePasswordForm";
import useChangePasswordPage from "../hooks/useChangePasswordPage";
import "../styles/change-password-page.css";

export default function ChangePasswordPage() {
  const {
    booting,
    form,
    errors,
    strengthText,
    submitting,
    toast,
    setToast,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useChangePasswordPage();

  if (booting) {
    return (
      <div className="change-password-page">
        <div className="change-password-page__container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="change-password-page">
      <div className="change-password-page__container">
        {toast.message ? (
          <Toast
            kind={toast.kind}
            message={toast.message}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-700">
                Account Security
              </div>
              <h1 className="mt-3 text-[2rem] font-black tracking-tight text-slate-950">
                Change Password
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Update your password to keep your account secure.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to profile
            </button>
          </div>
        </section>

        <ChangePasswordForm
          form={form}
          errors={errors}
          strengthText={strengthText}
          submitting={submitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}