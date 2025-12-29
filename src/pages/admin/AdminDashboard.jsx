import React, { useState, useEffect } from "react";
import { apiClient } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
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
  const { hasPermission, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
    profile: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  // Permission checks
  const canViewPending = hasPermission("profiles.view_pending");
  const canApproveProfiles = hasPermission("profiles.approve");
  const canManageUsers = hasPermission("users.manage");
  const canViewSettings = hasPermission("settings.view");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === "pending" && canViewPending) {
        const { data } = await apiClient.get("/user/profile/admin/pending");
        setPendingProfiles(data.data || []);
      } else if (activeTab === "roles" && canManageUsers) {
        const [rolesRes, permsRes] = await Promise.all([
          apiClient.get("/admin/rbac/roles"),
          apiClient.get("/admin/rbac/permissions"),
        ]);
        setRoles(rolesRes.data.data || []);
        setPermissions(permsRes.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await apiClient.patch(`/user/profile/admin/approve/${userId}`, {
        status: "ACTIVE",
      });
      setPendingProfiles((prev) => prev.filter((p) => p.id !== userId));
      setActionModal({ open: false, type: null, profile: null });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve profile");
    }
  };

  const handleReject = async (userId) => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    try {
      await apiClient.patch(`/user/profile/admin/approve/${userId}`, {
        status: "REJECTED",
        reason: rejectionReason,
      });
      setPendingProfiles((prev) => prev.filter((p) => p.id !== userId));
      setActionModal({ open: false, type: null, profile: null });
      setRejectionReason("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject profile");
    }
  };

  const openApproveModal = (profile) => {
    setActionModal({ open: true, type: "approve", profile });
  };

  const openRejectModal = (profile) => {
    setActionModal({ open: true, type: "reject", profile });
    setRejectionReason("");
  };

  const closeModal = () => {
    setActionModal({ open: false, type: null, profile: null });
    setRejectionReason("");
  };

  // Tab configuration based on permissions
  const tabs = [
    {
      id: "pending",
      label: "Pending Profiles",
      permission: "profiles.view_pending",
      count: pendingProfiles.length,
    },
    { id: "roles", label: "Roles & Permissions", permission: "users.manage" },
    { id: "settings", label: "Settings", permission: "settings.view" },
  ].filter((tab) => hasPermission(tab.permission));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome, {user?.email} • {user?.accessRole?.name || "Admin"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {user?.accessRole?.name || "Admin"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Pending Profiles Tab */}
            {activeTab === "pending" && (
              <PendingProfilesTab
                profiles={pendingProfiles}
                canApprove={canApproveProfiles}
                onApprove={openApproveModal}
                onReject={openRejectModal}
                onViewDetails={setSelectedProfile}
              />
            )}

            {/* Roles Tab */}
            {activeTab === "roles" && (
              <RolesTab
                roles={roles}
                permissions={permissions}
                onRefresh={fetchData}
              />
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && <SettingsTab />}
          </>
        )}
      </main>

      {/* Action Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {actionModal.type === "approve" ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Approve Profile
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to approve{" "}
                  <strong>{actionModal.profile?.email}</strong>'s profile? They
                  will be notified via email.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprove(actionModal.profile?.id)}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Reject Profile
                </h3>
                <p className="text-gray-600 mb-4">
                  Please provide a reason for rejecting{" "}
                  <strong>{actionModal.profile?.email}</strong>'s profile.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full p-3 border border-gray-300 rounded-xl mb-4 h-32 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(actionModal.profile?.id)}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile Details Modal */}
      {selectedProfile && (
        <ProfileDetailsModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
};

// --- Sub-Components ---

const PendingProfilesTab = ({
  profiles,
  canApprove,
  onApprove,
  onReject,
  onViewDetails,
}) => {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          All caught up!
        </h3>
        <p className="text-gray-500">No pending profiles to review.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-600">
                  {profile.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {profile.profile?.legalName || "No name provided"}
                </h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {profile.role || "No role"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Step {profile.onboardingStep}/6 completed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDetails(profile)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                View Details
              </button>
              {canApprove && (
                <>
                  <button
                    onClick={() => onReject(profile)}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(profile)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4">
            <InfoItem label="Phone" value={profile.profile?.phoneNumber} />
            <InfoItem
              label="DOB"
              value={
                profile.profile?.dob
                  ? new Date(profile.profile.dob).toLocaleDateString()
                  : null
              }
            />
            <InfoItem label="Education" value={profile.profile?.education} />
            <InfoItem
              label="Submitted"
              value={new Date(profile.createdAt).toLocaleDateString()}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-sm text-gray-900 font-medium mt-0.5">{value || "—"}</p>
  </div>
);

const ProfileDetailsModal = ({ profile, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Legal Name"
                value={profile.profile?.legalName}
              />
              <DetailItem label="Email" value={profile.email} />
              <DetailItem label="Phone" value={profile.profile?.phoneNumber} />
              <DetailItem
                label="Date of Birth"
                value={
                  profile.profile?.dob
                    ? new Date(profile.profile.dob).toLocaleDateString()
                    : null
                }
              />
              <DetailItem label="Address" value={profile.profile?.address} />
              <DetailItem label="Role" value={profile.role} />
            </div>
          </Section>

          {/* Background */}
          {profile.profile && (
            <Section title="Background">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Education"
                  value={profile.profile.education}
                />
                <DetailItem
                  label="Occupation"
                  value={profile.profile.occupation}
                />
                <DetailItem
                  label="Nationality"
                  value={profile.profile.nationality}
                />
                <DetailItem label="Diet" value={profile.profile.diet} />
                <DetailItem
                  label="Height"
                  value={
                    profile.profile.height
                      ? `${profile.profile.height} cm`
                      : null
                  }
                />
                <DetailItem
                  label="Weight"
                  value={
                    profile.profile.weight
                      ? `${profile.profile.weight} kg`
                      : null
                  }
                />
                <DetailItem
                  label="Hair Color"
                  value={profile.profile.hairColor}
                />
                <DetailItem
                  label="Eye Color"
                  value={profile.profile.eyeColor}
                />
              </div>
              {profile.profile.bio && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Bio</p>
                  <p className="text-gray-900">{profile.profile.bio}</p>
                </div>
              )}
            </Section>
          )}

          {/* Health */}
          {profile.health && (
            <Section title="Health Information">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Diabetes"
                  value={profile.health.hasDiabetes ? "Yes" : "No"}
                />
                <DetailItem
                  label="Heart Condition"
                  value={profile.health.hasHeartCondition ? "Yes" : "No"}
                />
                <DetailItem
                  label="Autoimmune"
                  value={profile.health.hasAutoimmune ? "Yes" : "No"}
                />
                <DetailItem
                  label="CMV Status"
                  value={profile.health.cmvStatus}
                />
                <DetailItem
                  label="Allergies"
                  value={profile.health.allergies ? "Yes" : "No"}
                />
                <DetailItem
                  label="HIV/Hep Status"
                  value={profile.health.hivHepStatus ? "Positive" : "Negative"}
                />
              </div>
            </Section>
          )}

          {/* Genetic */}
          {profile.genetic && (
            <Section title="Genetic Information">
              <DetailItem
                label="Carrier Conditions"
                value={
                  profile.genetic.carrierConditions?.join(", ") ||
                  "None reported"
                }
              />
              {profile.genetic.reportFileUrl && (
                <a
                  href={profile.genetic.reportFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-indigo-600 hover:underline"
                >
                  📄 View Genetic Report
                </a>
              )}
            </Section>
          )}

          {/* Compensation */}
          {profile.compensation && (
            <Section title="Compensation Preferences">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Interested"
                  value={profile.compensation.isInterested ? "Yes" : "No"}
                />
                <DetailItem
                  label="Allow Bidding"
                  value={profile.compensation.allowBidding ? "Yes" : "No"}
                />
                <DetailItem
                  label="Asking Price"
                  value={
                    profile.compensation.askingPrice
                      ? `$${profile.compensation.askingPrice}`
                      : null
                  }
                />
                <DetailItem
                  label="Minimum Accepted"
                  value={
                    profile.compensation.minAcceptedPrice
                      ? `$${profile.compensation.minAcceptedPrice}`
                      : null
                  }
                />
              </div>
            </Section>
          )}

          {/* Identity Documents */}
          {profile.identityDocuments?.length > 0 && (
            <Section title="Identity Documents">
              <div className="grid grid-cols-2 gap-4">
                {profile.identityDocuments.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <span className="text-2xl">🪪</span>
                    <div>
                      <p className="font-medium text-gray-900">{doc.type}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
      {title}
    </h3>
    {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm text-gray-900 font-medium">{value || "—"}</p>
  </div>
);

// --- Roles Tab ---
const RolesTab = ({ roles, permissions, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissionSlugs: [],
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return;

    setIsCreating(true);
    try {
      await apiClient.post("/admin/rbac/roles", newRole);
      setShowCreateModal(false);
      setNewRole({ name: "", description: "", permissionSlugs: [] });
      onRefresh();
    } catch (err) {
      console.error("Failed to create role:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const togglePermission = (slug) => {
    setNewRole((prev) => ({
      ...prev,
      permissionSlugs: prev.permissionSlugs.includes(slug)
        ? prev.permissionSlugs.filter((s) => s !== slug)
        : [...prev.permissionSlugs, slug],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Roles & Permissions
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          + Create Role
        </button>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{role.name}</h3>
                {role.description && (
                  <p className="text-sm text-gray-500">{role.description}</p>
                )}
              </div>
              {role.isSystem && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                  System Role
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {role.permissions?.map((perm) => (
                <span
                  key={perm.id}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {perm.slug}
                </span>
              ))}
              {(!role.permissions || role.permissions.length === 0) && (
                <span className="text-sm text-gray-400">
                  No permissions assigned
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Create New Role
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Moderator"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {permissions.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newRole.permissionSlugs.includes(perm.slug)}
                        onChange={() => togglePermission(perm.slug)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{perm.slug}</span>
                      {perm.description && (
                        <span className="text-xs text-gray-400">
                          — {perm.description}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={isCreating || !newRole.name.trim()}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Settings Tab ---
const SettingsTab = () => {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await apiClient.get("/settings");
      setSettings(data.data || {});
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put("/settings", settings);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSetting = () => {
    if (newKey.trim() && newValue.trim()) {
      setSettings((prev) => ({ ...prev, [newKey.trim()]: newValue.trim() }));
      setNewKey("");
      setNewValue("");
    }
  };

  const handleDelete = async (key) => {
    if (!confirm(`Delete setting "${key}"?`)) return;

    try {
      await apiClient.delete(`/settings/${key}`);
      setSettings((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete setting");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Application Settings
        </h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{key}</p>
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              onClick={() => handleDelete(key)}
              className="text-red-500 hover:text-red-700 p-2"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        ))}

        {/* Add New Setting */}
        <div className="p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Add New Setting
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Key"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleAddSetting}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
