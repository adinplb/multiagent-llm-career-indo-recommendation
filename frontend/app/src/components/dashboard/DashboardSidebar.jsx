import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/overview", icon: "dashboard", label: "Overview" },
  { to: "/analyze", icon: "analytics", label: "Analysis" },
  { to: "/history", icon: "history", label: "History" },
  { to: "/settings", icon: "settings", label: "Settings" },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-surface-bright border-r border-outline-variant flex flex-col h-screen sticky top-0 shrink-0">
      <Link to="/overview" className="h-16 flex items-center px-6 border-b border-outline-variant shrink-0">
        <span className="font-headline-md text-headline-md font-bold text-primary">Cerah AI</span>
      </Link>

      <nav className="flex-grow flex flex-col gap-2 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {item.icon}
              </span>
              <span className="font-body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant flex flex-col gap-sm">
        <button
          onClick={() => navigate("/analyze")}
          className="bg-primary text-on-primary rounded-lg px-4 py-3 font-body-sm text-body-sm hover:opacity-90 transition-opacity w-full flex justify-center items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">psychology</span>
          Analyze Career
        </button>
        <div className="flex items-center gap-sm mt-sm">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant shrink-0">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-body-sm font-bold text-on-surface truncate">Demo Profile</span>
            <span className="font-label-caps text-outline truncate">Riwayat tersimpan per-browser</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
