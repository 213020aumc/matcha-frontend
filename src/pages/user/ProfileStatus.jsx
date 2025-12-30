import React from "react";
import { useNavigate } from "react-router-dom"; // Optional if you need manual redirect
import { useAuthStore } from "../../store/authStore";
import {
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
  LogOut, // Import LogOut icon
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { statusStyles as styles } from "../../styles/onboarding";

export const ProfileStatus = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const status = user?.profileStatus || "PENDING_REVIEW";

  const handleLogout = () => {
    logout();
    navigate("/login"); // Ensure redirect happens
  };

  const renderStatusMessage = () => {
    switch (status) {
      case "ACTIVE":
        return {
          title: "Profile Approved!",
          text: "Your profile is now live and visible to potential matches. You can now access the full dashboard.",
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
        };
      case "REJECTED":
        return {
          title: "Profile Needs Attention",
          text: "We found some issues with your submission. Please check your email for details or contact support.",
          icon: <XCircle className="h-6 w-6 text-red-600" />,
        };
      default:
        return {
          title: "Under Review",
          text: "Our team is currently reviewing your documents and medical history. This typically takes 24-48 hours.",
          icon: <Clock className="h-6 w-6 text-yellow-600" />,
        };
    }
  };

  const statusInfo = renderStatusMessage();

  return (
    <div className={styles.container}>
      {/* HEADER ROW WITH LOGOUT */}
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* STATUS HEADER */}
      <div className={styles.banner(status)}>
        <div className={styles.iconWrapper}>{statusInfo.icon}</div>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>{statusInfo.title}</h1>
          <p className={styles.bannerText}>{statusInfo.text}</p>
        </div>
      </div>

      {/* ACTION CARDS */}
      <h2 className={styles.sectionTitle}>What's Next?</h2>

      <div className={styles.grid}>
        {/* Card 1: View Profile */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <FileText size={20} />
          </div>
          <h3 className={styles.cardTitle}>Review Submission</h3>
          <p className={styles.cardText}>
            View the data you submitted for your profile, health, and genetics
            to ensure accuracy.
          </p>
          <Button variant="secondary" className={styles.fullWidthButton}>
            View Profile
          </Button>
        </div>

        {/* Card 2: Verification */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <ShieldCheck size={20} />
          </div>
          <h3 className={styles.cardTitle}>Verification Status</h3>
          <p className={styles.cardText}>
            Your ID verification is currently pending. Check here for updates.
          </p>
          <a href="#" className={styles.cardLink}>
            Check Status <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileStatus;
