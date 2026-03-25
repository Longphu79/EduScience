import React from "react";
import Button from "../../../shared/components/Button";
import ProfileField from "./ProfileField";

export default function ChangePasswordForm({
  form,
  errors,
  strengthText,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5">
          <ProfileField label="Current password" error={errors.oldPassword}>
            <input
              type="password"
              name="oldPassword"
              value={form.oldPassword}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </ProfileField>

          <ProfileField
            label="New password"
            error={errors.newPassword}
            hint={`Password strength: ${strengthText}`}
          >
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </ProfileField>

          <ProfileField
            label="Confirm new password"
            error={errors.confirmPassword}
          >
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </ProfileField>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" loading={submitting} disabled={submitting}>
              {submitting ? "Saving..." : "Update password"}
            </Button>

            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}