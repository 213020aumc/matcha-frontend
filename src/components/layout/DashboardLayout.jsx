import { Outlet, NavLink } from "react-router-dom";
import { Navbar } from "./Navbar";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Shield,
} from "lucide-react";

// Web Layout Styles
const styles = {
  layout: "min-h-screen bg-gray-50",
  mainWrapper:
    "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8",
  sidebar: "w-full md:w-64 flex-shrink-0",
  sidebarCard:
    "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24", // Sticky for Web
  navItem: (isActive) => `
    flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-4
    ${
      isActive
        ? "bg-primary/5 text-primary border-primary"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"
    }
  `,
  navLabel:
    "bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider",
  contentArea: "flex-1 min-w-0",
};

export const DashboardLayout = () => {
  return (
    <div className={styles.layout}>
      <Navbar />

      <div className={styles.mainWrapper}>
        {/* SIDEBAR NAVIGATION */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <nav className="flex flex-col py-2">
              <div className={styles.navLabel}>Overview</div>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => styles.navItem(isActive)}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>

              <div className={styles.navLabel + " mt-2"}>Management</div>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => styles.navItem(isActive)}
              >
                <Users size={18} />
                Users
              </NavLink>
              <NavLink
                to="/admin/approvals"
                className={({ isActive }) => styles.navItem(isActive)}
              >
                <FileText size={18} />
                Pending Approvals
              </NavLink>

              <div className={styles.navLabel + " mt-2"}>System</div>
              <NavLink
                to="/admin/roles"
                className={({ isActive }) => styles.navItem(isActive)}
              >
                <Shield size={18} />
                Roles & Permissions
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) => styles.navItem(isActive)}
              >
                <Settings size={18} />
                Settings
              </NavLink>
            </nav>
          </div>
        </aside>

        {/* MAIN PAGE CONTENT */}
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
