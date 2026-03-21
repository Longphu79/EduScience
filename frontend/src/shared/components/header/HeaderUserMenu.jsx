import React from "react";

export default function HeaderUserMenu({
  open,
  user,
  userRole,
  isStudent,
  isInstructor,
  isAdmin,
  onToggle,
  onClose,
  onNavigate,
  onLogout,
  icons,
}) {
  const LogoutIcon = icons?.logout;
  const UserIcon = icons?.user;
  const DashboardIcon = icons?.dashboard;
  const EditIcon = icons?.edit;
  const AdminIcon = icons?.admin;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_16px_30px_rgba(15,23,42,0.12)]"
      >
        <img
          src={
            user?.avatarUrl ||
            "https://ui-avatars.com/api/?name=User&background=111827&color=fff"
          }
          alt={user?.username || "User"}
          className="h-9 w-9 rounded-full object-cover"
        />
        <svg
          className="h-4 w-4 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="header-user-menu absolute right-0 top-[calc(100%+12px)] z-[120] w-[270px] overflow-hidden rounded-[22px] border border-white/70 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatarUrl ||
                  "https://ui-avatars.com/api/?name=User&background=111827&color=fff"
                }
                alt={user?.username || "User"}
                className="h-11 w-11 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">
                  {user?.fullName || user?.name || user?.username || "User"}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {user?.email || "No email"}
                </div>
                <div className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  {userRole || "user"}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onNavigate?.("/profile");
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {UserIcon ? <UserIcon className="h-4 w-4" /> : null}
              View Profile
            </button>

            <button
              type="button"
              onClick={() => {
                onClose?.();
                onNavigate?.("/profile/edit");
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {EditIcon ? <EditIcon className="h-4 w-4" /> : null}
              Edit Profile
            </button>

            {isStudent ? (
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onNavigate?.("/dashboard/student");
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {DashboardIcon ? <DashboardIcon className="h-4 w-4" /> : null}
                Dashboard
              </button>
            ) : null}

            {isInstructor ? (
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onNavigate?.("/dashboard/instructor");
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {DashboardIcon ? <DashboardIcon className="h-4 w-4" /> : null}
                Instructor Dashboard
              </button>
            ) : null}

            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onNavigate?.("/admin/dashboard");
                }}
                className="flex w-full items-center gap-3 rounded-2xl bg-red-50 px-3 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                {AdminIcon ? <AdminIcon className="h-4 w-4" /> : null}
                Admin Dashboard
              </button>
            ) : null}

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              {LogoutIcon ? <LogoutIcon className="h-4 w-4" /> : null}
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}