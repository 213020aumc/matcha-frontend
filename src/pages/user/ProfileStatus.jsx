import { useAuthStore } from "../../store/authStore";
import {
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/Button";

const styles = {
  container: "max-w-4xl mx-auto px-4 py-12",
  // Status Banner
  banner: (status) => {
    const colors = {
      PENDING_REVIEW: "bg-yellow-50 border-yellow-200 text-yellow-800",
      ACTIVE: "bg-green-50 border-green-200 text-green-800",
      REJECTED: "bg-red-50 border-red-200 text-red-800",
    };
    return `p-6 rounded-xl border ${
      colors[status] || colors.PENDING_REVIEW
    } mb-8 flex items-start gap-4`;
  },
  iconWrapper: "mt-1 flex-shrink-0",
  bannerTitle: "text-lg font-bold mb-1",
  bannerText: "text-sm opacity-90",
  // Content Section
  sectionTitle: "text-xl font-bold text-gray-900 mb-6",
  grid: "grid grid-cols-1 md:grid-cols-3 gap-6",
  card: "bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow",
  cardIcon:
    "h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary mb-4",
  cardTitle: "font-semibold text-gray-900 mb-2",
  cardText: "text-sm text-gray-500 mb-4",
  link: "text-sm font-medium text-primary flex items-center gap-1 hover:underline",
};

export const ProfileStatus = () => {
  const { user } = useAuthStore();
  const status = user?.profileStatus || "PENDING_REVIEW";

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
      {/* STATUS HEADER */}
      <div className={styles.banner(status)}>
        <div className={styles.iconWrapper}>{statusInfo.icon}</div>
        <div>
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
            View the data you submitted for your profile, health, and genetics.
          </p>
          <Button variant="secondary" className="w-full text-sm">
            View Profile
          </Button>
        </div>

        {/* Card 2: Help Center */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <CheckCircle size={20} />
          </div>
          <h3 className={styles.cardTitle}>Verification</h3>
          <p className={styles.cardText}>
            Complete your ID verification to speed up the process.
          </p>
          <a href="#" className={styles.link}>
            Check Status <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};
