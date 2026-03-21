import React from "react";

export default function ProfilePreviewCard({
  coverPreview,
  avatarPreview,
  form,
  role,
  roleMeta,
  isInstructor,
  isAdmin,
  previewItems = [],
}) {
  const shouldShowTags = !isAdmin;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Live Preview</h2>
        <p className="mt-1 text-sm text-slate-500">
          Preview how your profile can appear.
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-40 overflow-hidden bg-slate-100">
          <img
            src={coverPreview}
            alt="Cover preview"
            className="h-full w-full object-cover"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${roleMeta.gradientClass} opacity-35`}
          />
        </div>

        <div className="relative px-5 pb-5">
          <img
            src={avatarPreview}
            alt="Avatar preview"
            className="-mt-12 h-24 w-24 rounded-[24px] border-4 border-white object-cover shadow-lg"
          />

          <div
            className={`mt-4 inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${roleMeta.badgeClass}`}
          >
            {role}
          </div>

          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            {form.fullName || "Your name"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {form.headline || "Your short headline"}
          </p>

          <p className="mt-4 text-sm leading-6 text-slate-700">
            {form.bio || "Your bio will appear here."}
          </p>

          {shouldShowTags ? (
            <div className="mt-5">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {isInstructor ? "Expertise preview" : "Learning goals preview"}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {previewItems.slice(0, 8).map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    {item}
                  </span>
                ))}

                {!previewItems.length ? (
                  <span className="text-sm text-slate-400">No items yet</span>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Admin preview emphasizes credibility, clarity and platform trust.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}