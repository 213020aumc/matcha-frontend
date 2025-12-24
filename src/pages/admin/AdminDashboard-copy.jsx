// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { apiClient } from "../../services/api";
import { Button } from "../../components/ui/Button";

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleReview = async (userId, status, reason = "") => {
    if (!confirm(`Are you sure you want to ${status} this user?`)) return;

    try {
      await apiClient.patch(`/admin/approve/${userId}`, { status, reason });
      setUsers(users.filter((u) => u.id !== userId)); // Remove from list locally
      alert(`User ${status} successfully`);
    } catch (error) {
      alert("Action failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Registered
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {user.email}
                  </div>
                  <div className="text-xs text-gray-500">ID: {user.id}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleReview(user.id, "ACTIVE")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      const reason = prompt("Reason for rejection:");
                      if (reason) handleReview(user.id, "REJECTED", reason);
                    }}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No pending profiles.
          </div>
        )}
      </div>
    </div>
  );
};
