import { useEffect, useState } from "react";
import { apiClient } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { pageStyles, cardStyles } from "../../styles/theme";

const styles = {
  table: "min-w-full divide-y divide-gray-200",
  th: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  td: "px-6 py-4 whitespace-nowrap text-sm",
  statusBadge: (status) => {
    const colors = {
      PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      colors[status] || "bg-gray-100"
    }`;
  },
};

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  const fetchPending = async () => {
    try {
      const { data } = await apiClient.get("/admin/pending");
      setUsers(data.data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.title}>Admin Dashboard</h1>
        <p className={pageStyles.subtitle}>
          Manage user profiles and approvals
        </p>
      </div>

      <div className={cardStyles.wrapper}>
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead className="bg-gray-50">
              <tr>
                <th className={styles.th}>User Details</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Submitted</th>
                <th className={`${styles.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className={styles.td}>
                    <div className="font-medium text-gray-900">
                      {user.profile?.legalName || "N/A"}
                    </div>
                    <div className="text-gray-500">{user.email}</div>
                  </td>
                  <td className={styles.td}>{user.role}</td>
                  <td className={styles.td}>
                    <span className={styles.statusBadge(user.profileStatus)}>
                      {user.profileStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className={`${styles.td} text-right space-x-2`}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(user.profile.reportFileUrl)}
                    >
                      View Report
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(user.id)}>
                      Approve
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
