import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LogOut, User, Menu, X } from "lucide-react";
import { cardStyles } from "../../styles/theme";

const styles = {
  nav: "bg-white border-b border-gray-200 sticky top-0 z-50",
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  wrapper: "flex justify-between h-16",
  leftSide: "flex items-center",
  logo: "flex-shrink-0 flex items-center",
  logoText: "text-2xl font-bold text-primary",
  rightSide: "hidden sm:ml-6 sm:flex sm:items-center space-x-4",
  mobileMenuBtn: "flex items-center sm:hidden",
  userBtn:
    "flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors focus:outline-none",
  avatar:
    "h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold",
  logoutBtn:
    "text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50",
  mobileMenu: "sm:hidden bg-white border-b border-gray-200",
  mobileLink:
    "block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50",
};

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* Logo */}
          <div className={styles.leftSide}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoText}>Helix</span>
            </Link>
          </div>

          {/* Desktop Right Menu */}
          <div className={styles.rightSide}>
            <div className={styles.userBtn}>
              <div className={styles.avatar}>
                {user?.profile?.legalName?.charAt(0) || <User size={16} />}
              </div>
              <span>{user?.profile?.legalName || user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className={styles.mobileMenuBtn}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className={styles.mobileMenu}>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className={styles.avatar}>
                {user?.profile?.legalName?.charAt(0) || "U"}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user?.profile?.legalName || "User"}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
