import { Link, useLocation } from "react-router-dom";
import "../styles/admin-tabs.css";

const tabs = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Users", to: "/admin/users" },
  { label: "Courses", to: "/admin/courses" },
];

function isActiveTab(pathname, to) {
  if (to === "/admin/dashboard") {
    return pathname === "/admin/dashboard";
  }

  return pathname.startsWith(to);
}

export default function AdminTabs() {
  const location = useLocation();

  return (
    <div className="admin-tabs">
      <div className="admin-tabs__list">
        {tabs.map((tab) => {
          const active = isActiveTab(location.pathname, tab.to);

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`admin-tabs__item ${
                active ? "admin-tabs__item--active" : ""
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}