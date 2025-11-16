import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosConfig";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Default Leaflet icon fix (if needed)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Image modal for viewing existing user images
    const [selectedImage, setSelectedImage] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Add user modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);

    const [newUser, setNewUser] = useState({
        ic: "",
        username: "",
        address: "",
        latitude: "",
        longitude: "",
    });

    // Image upload state for new user
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Map + search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(null);

    // const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/api/user/user-data"); 
            setUsers(res.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching users:", err);
            setLoading(false);
            alert("Failed to load user list.");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            await axiosInstance.patch(`/api/user/soft-delete/${userId}`);
            alert("User deleted (soft delete) successfully.");
            fetchUsers();
        } catch (err) {
            console.error("Error deleting user:", err);
            const msg =
                err.response?.data?.message || "Failed to delete user. Please try again.";
            alert(msg);
        }
    };

    // --------- Image view modal for existing users ----------
    const openImageModal = (imageDataUrl) => {
        if (!imageDataUrl) {
            alert("No image available.");
            return;
        }
        setSelectedImage(imageDataUrl);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setIsImageModalOpen(false);
    };

    // --------- Add new user modal handlers ----------

    const openAddModal = () => {
        setNewUser({
            ic: "",
            username: "",
            address: "",
            latitude: "",
            longitude: "",
        });
        setImageFile(null);
        setImagePreview(null);
        setSearchQuery("");
        setSearchResults([]);
        setSelectedPosition(null);
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        if (addLoading) return;
        setIsAddModalOpen(false);
    };

    const handleNewUserChange = (field, value) => {
        setNewUser((prev) => ({ ...prev, [field]: value }));
    };

    // Image validation on upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG and PNG images are allowed.");
            return;
        }

        if (file.size > maxSize) {
            alert("Image size must be less than 5MB.");
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // Use Nominatim for address search
    const handleSearchAddress = async () => {
        if (!searchQuery.trim()) {
            alert("Please enter an address to search.");
            return;
        }

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                    searchQuery
                )}&format=json&addressdetails=1&limit=5`
            );
            const data = await res.json();
            setSearchResults(data || []);
        } catch (err) {
            console.error("Error searching address:", err);
            alert("Failed to search address.");
        }
    };

    const handleSelectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setSelectedPosition([lat, lon]);
        setNewUser((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lon.toString(),
            address: result.display_name || prev.address,
        }));
        setSearchResults([]);
        setSearchQuery(result.display_name || "");
    };

    // Allow clicking on map to set location too
    const LocationSelector = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setSelectedPosition([lat, lng]);
                setNewUser((prev) => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                }));
            },
        });
        return null;
    };

    const isValidIc = (ic) => {
        if (!ic) return false;
        const trimmed = ic.trim();
        const icRegex = /^(\d{6}-\d{2}-\d{4}|\d{12})$/;
        return icRegex.test(trimmed);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (!newUser.ic || !newUser.username) {
            alert("IC and username are required.");
            return;
        }

        if (!isValidIc(newUser.ic)) {
            alert(
                "Invalid IC format. Please enter a valid IC:\n" +
                "- 12 digits (e.g. 010203040506), or\n" +
                "- Formatted as 6-2-4 digits (e.g. 010203-04-0506)."
            );
            return;
        }

        if (!newUser.address || !newUser.latitude || !newUser.longitude) {
            alert("Please select a location (address, latitude and longitude).");
            return;
        }

        if (!imageFile) {
            alert("Please upload an image.");
            return;
        }

        setAddLoading(true);

        try {
            const formData = new FormData();
            formData.append("ic", newUser.ic);
            formData.append("username", newUser.username);
            formData.append("address", newUser.address);
            formData.append("latitude", newUser.latitude);
            formData.append("longitude", newUser.longitude);
            formData.append("image", imageFile);

            const res = await axiosInstance.post("/api/user/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert(res.data.message || "User created successfully.");
            setAddLoading(false);
            setIsAddModalOpen(false);
            fetchUsers();
        } catch (err) {
            console.error("Error creating user:", err);
            const msg =
                err.response?.data?.message || "Failed to create user. Please try again.";
            alert(msg);
            setAddLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.centered}>Loading users...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <h2 style={styles.title}>User List</h2>
                <button
                    type="button"
                    style={styles.addButton}
                    onClick={openAddModal}
                >
                    Add New User
                </button>
            </div>

            {users.length === 0 ? (
                <div style={styles.noData}>No users found.</div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>IC</th>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Image</th>
                                <th style={styles.th}>Created At</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id}>
                                    <td style={styles.td}>{user.id}</td>
                                    <td style={styles.td}>{user.ic}</td>
                                    <td style={styles.td}>{user.username}</td>
                                    <td style={styles.td}>
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.username}
                                                style={styles.thumbnail}
                                                onClick={() => openImageModal(user.image)}
                                            />
                                        ) : (
                                            <span style={styles.noImageText}>No image</span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            type="button"
                                            style={styles.deleteButton}
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Existing image view modal */}
            {isImageModalOpen && selectedImage && (
                <div style={styles.modalOverlay} onClick={closeImageModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="User" style={styles.modalImage} />
                        <button
                            type="button"
                            style={styles.modalCloseButton}
                            onClick={closeImageModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Add User modal */}
            {isAddModalOpen && (
                <div style={styles.modalOverlay} onClick={closeAddModal}>
                    <div
                        style={styles.addModalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={styles.modalTitle}>Add New User</h3>
                        <form onSubmit={handleCreateUser} style={styles.form}>
                            <div style={styles.formRow}>
                                <label style={styles.label}>IC:</label>
                                <input
                                    type="text"
                                    value={newUser.ic}
                                    onChange={(e) =>
                                        handleNewUserChange("ic", e.target.value)
                                    }
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formRow}>
                                <label style={styles.label}>Username:</label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) =>
                                        handleNewUserChange("username", e.target.value)
                                    }
                                    style={styles.input}
                                    required
                                />
                            </div>

                            {/* Address search + map */}
                            <div style={styles.formRow}>
                                <label style={styles.label}>Search Address:</label>
                                <div style={styles.searchRow}>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        style={styles.input}
                                        placeholder="Enter address to search"
                                    />
                                    <button
                                        type="button"
                                        style={styles.smallButton}
                                        onClick={handleSearchAddress}
                                    >
                                        Search
                                    </button>
                                </div>
                                {searchResults.length > 0 && (
                                    <div style={styles.searchResults}>
                                        {searchResults.map((r) => (
                                            <div
                                                key={r.place_id}
                                                style={styles.searchResultItem}
                                                onClick={() =>
                                                    handleSelectSearchResult(r)
                                                }
                                            >
                                                {r.display_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={styles.formRow}>
                                <label style={styles.label}>Selected Address:</label>
                                <textarea
                                    value={newUser.address}
                                    onChange={(e) =>
                                        handleNewUserChange("address", e.target.value)
                                    }
                                    style={styles.textarea}
                                    rows={2}
                                    required
                                />
                            </div>

                            <div style={styles.formRow}>
                                <label style={styles.label}>Latitude:</label>
                                <input
                                    type="text"
                                    value={newUser.latitude}
                                    onChange={(e) =>
                                        handleNewUserChange("latitude", e.target.value)
                                    }
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formRow}>
                                <label style={styles.label}>Longitude:</label>
                                <input
                                    type="text"
                                    value={newUser.longitude}
                                    onChange={(e) =>
                                        handleNewUserChange("longitude", e.target.value)
                                    }
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.mapWrapper}>
                                <MapContainer
                                    center={[4.5, 102]}
                                    zoom={6}
                                    style={styles.map}
                                >
                                    <TileLayer
                                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap contributors'
                                    />
                                    <LocationSelector />
                                    {selectedPosition && (
                                        <Marker position={selectedPosition} />
                                    )}
                                </MapContainer>
                                <p style={styles.mapHint}>
                                    Click on the map to set location, or use search above.
                                </p>
                            </div>

                            <div style={styles.formRow}>
                                <label style={styles.label}>Image:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={styles.input}
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={styles.previewImage}
                                    />
                                )}
                            </div>

                            <div style={styles.modalButtons}>
                                <button
                                    type="button"
                                    style={styles.cancelButton}
                                    onClick={closeAddModal}
                                    disabled={addLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={styles.saveButton}
                                    disabled={addLoading}
                                >
                                    {addLoading ? "Saving..." : "Save User"}
                                </button>
                            </div>
                        </form>
                    </div>
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
        boxSizing: "border-box",
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
    },
    title: {
        fontSize: "24px",
        color: "#1A2F52",
        margin: 0,
    },
    addButton: {
        padding: "8px 16px",
        borderRadius: "20px",
        border: "none",
        backgroundColor: "#00b3a7",
        color: "#fff",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
    },
    tableContainer: {
        width: "100%",
        maxWidth: "100%",
        overflowX: "auto",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #ddd",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
    },
    th: {
        padding: "10px",
        borderBottom: "1px solid #ddd",
        textAlign: "left",
        backgroundColor: "#f4f4f4",
        fontWeight: "bold",
        whiteSpace: "nowrap",
    },
    td: {
        padding: "8px 10px",
        borderBottom: "1px solid #eee",
        verticalAlign: "middle",
    },
    thumbnail: {
        width: "50px",
        height: "50px",
        objectFit: "cover",
        borderRadius: "4px",
        cursor: "pointer",
        border: "1px solid " +
            "#ddd",
    },
    noImageText: {
        fontSize: "12px",
        color: "#888",
    },
    deleteButton: {
        padding: "4px 10px",
        borderRadius: "14px",
        border: "1px solid #ff4d4f",
        backgroundColor: "#fff",
        color: "#ff4d4f",
        cursor: "pointer",
        fontSize: "12px",
    },
    centered: {
        textAlign: "center",
        marginTop: "30px",
    },
    noData: {
        marginTop: "10px",
        fontStyle: "italic",
        color: "#666",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: "10px",
        borderRadius: "8px",
        maxWidth: "90%",
        maxHeight: "90%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    modalImage: {
        maxWidth: "80vw",
        maxHeight: "70vh",
        objectFit: "contain",
        marginBottom: "10px",
    },
    modalCloseButton: {
        padding: "6px 16px",
        borderRadius: "20px",
        border: "none",
        backgroundColor: "#00b3a7",
        color: "#fff",
        cursor: "pointer",
    },

    // Add user modal specific
    addModalContent: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "800px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxSizing: "border-box",
    },
    modalTitle: {
        marginTop: 0,
        marginBottom: "10px",
        fontSize: "20px",
        color: "#1A2F52",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    formRow: {
        display: "flex",
        flexDirection: "column",
        marginBottom: "8px",
    },
    label: {
        fontSize: "14px",
        marginBottom: "4px",
    },
    input: {
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "14px",
    },
    textarea: {
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "14px",
        resize: "vertical",
    },
    searchRow: {
        display: "flex",
        gap: "8px",
    },
    smallButton: {
        padding: "6px 10px",
        borderRadius: "4px",
        border: "none",
        backgroundColor: "#00b3a7",
        color: "#fff",
        cursor: "pointer",
        fontSize: "13px",
        whiteSpace: "nowrap",
    },
    searchResults: {
        marginTop: "5px",
        maxHeight: "120px",
        overflowY: "auto",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#fff",
        fontSize: "13px",
    },
    searchResultItem: {
        padding: "6px 8px",
        cursor: "pointer",
        borderBottom: "1px solid #eee",
    },
    mapWrapper: {
        marginTop: "10px",
    },
    map: {
        width: "100%",
        height: "250px",
        borderRadius: "6px",
    },
    mapHint: {
        fontSize: "12px",
        color: "#555",
        marginTop: "4px",
    },
    previewImage: {
        marginTop: "8px",
        width: "80px",
        height: "80px",
        objectFit: "cover",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },
    modalButtons: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "10px",
    },
    cancelButton: {
        padding: "8px 16px",
        borderRadius: "20px",
        border: "1px solid #ccc",
        backgroundColor: "#fff",
        color: "#333",
        cursor: "pointer",
    },
    saveButton: {
        padding: "8px 16px",
        borderRadius: "20px",
        border: "none",
        backgroundColor: "#00b3a7",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "bold",
    },
};

export default UserListPage;
