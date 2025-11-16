// RoleManagement.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosConfig";

const RoleManagement = ({ onAccessUpdated }) => {
    const [roles, setRoles] = useState([]);
    const [pages, setPages] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [selectedPageIds, setSelectedPageIds] = useState([]);
    const [viewMode, setViewMode] = useState(null); // 'users' | 'pages' | null
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [rolesRes, pagesRes] = await Promise.all([
                    axiosInstance.get("/api/access-control/roles-users"),
                    axiosInstance.get("/api/access-control/pages"),
                ]);

                setRoles(rolesRes.data);   
                setPages(pagesRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Error loading role management data:", err);
                setLoading(false);
                alert("Failed to load role management data.");
            }
        };

        fetchData();
    }, []);

    const loadRolePages = async (roleId) => {
        try {
            const res = await axiosInstance.get(`/api/access-control/role-pages/${roleId}`);
            const pageIds = res.data.map((p) => p.id);
            setSelectedPageIds(pageIds);
        } catch (err) {
            console.error("Error loading role pages:", err);
            alert("Failed to load page access for selected role.");
        }
    };

    const handleShowUsers = (roleId) => {
        setSelectedRoleId(roleId);
        setViewMode("users");
    };

    const handleShowPages = async (roleId) => {
        setSelectedRoleId(roleId);
        setViewMode("pages");
        await loadRolePages(roleId);
    };

    const handleCheckboxChange = (pageId) => {
        setSelectedPageIds((prev) => {
            if (prev.includes(pageId)) {
                return prev.filter((id) => id !== pageId);
            } else {
                return [...prev, pageId];
            }
        });
    };

    const handleSave = async () => {
        if (!selectedRoleId) return;

        try {
            setSaving(true);

            await axiosInstance.post("/api/access-control/update-role-pages", {
                roleId: selectedRoleId,
                pageIds: selectedPageIds,
            });

            setSaving(false);
            alert("Role access updated successfully.");

            // Refresh allowedPages / Navbar in Dashboard
            if (typeof onAccessUpdated === "function") {
                onAccessUpdated();
            }
        } catch (err) {
            console.error("Error saving role pages:", err);
            setSaving(false);
            alert("Failed to update role access.");
        }
    };

    if (loading) {
        return <div style={styles.centered}>Loading role management...</div>;
    }

    if (roles.length === 0) {
        return <div style={styles.centered}>No roles found.</div>;
    }

    const selectedRole = roles.find((r) => r.roleId === selectedRoleId);

    return (
        <div style={styles.container}>
            {/* <h2 style={styles.title}>Role-Based Access Management</h2> */}

            {/* Roles list full width */}
            <div style={styles.rolesTable}>
                <div style={styles.rolesHeader}>
                    <div style={styles.colRoleName}>Role</div>
                    <div style={styles.colActions}>Actions</div>
                </div>

                {roles.map((role) => (
                    <div
                        key={role.roleId}
                        style={{
                            ...styles.roleRow,
                            backgroundColor:
                                role.roleId === selectedRoleId ? "#f0f9f9" : "#ffffff",
                        }}
                    >
                        <div style={styles.colRoleName}>{role.roleName}</div>
                        <div style={styles.colActions}>
                            <button
                                style={styles.smallButton}
                                onClick={() => handleShowUsers(role.roleId)}
                            >
                                Show Users
                            </button>
                            <button
                                style={styles.smallButton}
                                onClick={() => handleShowPages(role.roleId)}
                            >
                                Page Access
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Users panel */}
            {selectedRole && viewMode === "users" && (
                <div style={styles.panel}>
                    <h3 style={styles.panelTitle}>
                        Users in role:{" "}
                        <span style={styles.highlight}>{selectedRole.roleName}</span>
                    </h3>
                    {selectedRole.users && selectedRole.users.length > 0 ? (
                        <div style={styles.usersList}>
                            {selectedRole.users.map((user) => (
                                <div key={user.id} style={styles.userRow}>
                                    <div style={styles.userName}>{user.username}</div>
                                    <div style={styles.userEmail}>{user.email}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.noData}>No users in this role.</div>
                    )}
                </div>
            )}

            {/* Page access panel */}
            {selectedRole && viewMode === "pages" && (
                <div style={styles.panel}>
                    <h3 style={styles.panelTitle}>
                        Page access for role:{" "}
                        <span style={styles.highlight}>{selectedRole.roleName}</span>
                    </h3>

                    {pages.length === 0 ? (
                        <div style={styles.noData}>No pages defined.</div>
                    ) : (
                        <div style={styles.checkboxList}>
                            {pages.map((page) => (
                                <label key={page.id} style={styles.checkboxItem}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPageIds.includes(page.id)}
                                        onChange={() => handleCheckboxChange(page.id)}
                                        style={styles.checkbox}
                                    />
                                    <span>
                                        {page.name}{" "}
                                        <span style={styles.pagePath}>({page.path})</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedRoleId}
                        style={styles.saveButton}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        width: "100%",
        padding: "20px", 
        boxSizing: "border-box",
    },
    title: {
        fontSize: "24px",
        marginBottom: "15px",
        color: "#1A2F52",
    },
    rolesTable: {
        width: "100%",
        borderRadius: "8px",
        border: "1px solid #ddd",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        marginBottom: "20px",
    },
    rolesHeader: {
        display: "flex",
        backgroundColor: "#f2f2f2",
        padding: "10px 15px",
        fontWeight: "bold",
        borderBottom: "1px solid #ddd",
    },
    roleRow: {
        display: "flex",
        padding: "10px 15px",
        borderBottom: "1px solid #eee",
        alignItems: "center",
    },
    colRoleName: {
        flex: 1,
        textTransform: "capitalize",
    },
    colActions: {
        display: "flex",
        gap: "8px",
    },
    smallButton: {
        padding: "6px 12px",
        borderRadius: "16px",
        border: "1px solid #00b3a7",
        backgroundColor: "#ffffff",
        color: "#00b3a7",
        cursor: "pointer",
        fontSize: "12px",
    },
    panel: {
        marginTop: "10px",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        backgroundColor: "#ffffff",
    },
    panelTitle: {
        fontSize: "18px",
        marginBottom: "10px",
        color: "#1A2F52",
    },
    highlight: {
        color: "#00b3a7",
        textTransform: "capitalize",
    },
    usersList: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    userRow: {
        padding: "8px 10px",
        borderRadius: "6px",
        border: "1px solid #eee",
        backgroundColor: "#f9f9f9",
    },
    userName: {
        fontWeight: "bold",
        fontSize: "14px",
    },
    userEmail: {
        fontSize: "12px",
        color: "#555",
    },
    noData: {
        fontStyle: "italic",
        color: "#888",
    },
    checkboxList: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "15px",
    },
    checkboxItem: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
    },
    checkbox: {
        marginRight: "8px",
    },
    pagePath: {
        fontSize: "12px",
        color: "#777",
    },
    saveButton: {
        padding: "8px 20px",
        borderRadius: "20px",
        border: "none",
        backgroundColor: "#00b3a7",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
    },
    centered: {
        textAlign: "center",
        marginTop: "30px",
    },
};

export default RoleManagement;
