// controllers/userController.js
const UserModel = require("../models/userModel");
const { encrypt, decrypt } = require("../utils/encryption");

const safeDecrypt = (value) => {
    if (!value) return null;
    try {
        return decrypt(value);
    } catch {
        return value; // old/plain data
    }
};

const decryptFromBlobOrTextIfEncrypted = (value) => {
    if (!value) return null;

    let text;
    if (Buffer.isBuffer(value)) {
        text = value.toString("utf8");
    } else {
        text = String(value);
    }

    const parts = text.split(":");
    if (parts.length !== 2) return null;

    let ivBuf;
    try {
        ivBuf = Buffer.from(parts[0], "base64");
    } catch {
        return null;
    }

    if (ivBuf.length !== 16) return null;

    try {
        return decrypt(text);
    } catch {
        return null;
    }
};

const normalizeIc = (v) => (v || "").toString().replace(/\D/g, "");

const UserController = {
    // API used by frontend: returns decrypted data + image data URL
    getUserData: async (req, res) => {
        try {
            const rows = await UserModel.getUserData();

            const users = rows.map((u) => {
                const icPlain = safeDecrypt(u.ic);
                const addressPlain = safeDecrypt(u.address);
                const latPlainStr = safeDecrypt(u.latitude);
                const lonPlainStr = safeDecrypt(u.longitude);

                const latNum =
                    latPlainStr !== null && latPlainStr !== undefined
                        ? Number(latPlainStr)
                        : null;
                const lonNum =
                    lonPlainStr !== null && lonPlainStr !== undefined
                        ? Number(lonPlainStr)
                        : null;

                let imageDataUrl = null;
                if (u.imageOri) {
                    const decryptedBase64 =
                        decryptFromBlobOrTextIfEncrypted(u.imageOri);

                    if (decryptedBase64) {
                        imageDataUrl = `data:image/jpeg;base64,${decryptedBase64}`;
                    } else if (Buffer.isBuffer(u.imageOri)) {
                        const base64 = u.imageOri.toString("base64");
                        imageDataUrl = `data:image/jpeg;base64,${base64}`;
                    } else if (typeof u.imageOri === "string") {
                        imageDataUrl = `data:image/jpeg;base64,${u.imageOri}`;
                    }
                }

                return {
                    id: u.id,
                    ic: icPlain,
                    username: u.username,
                    address: addressPlain,
                    latitude: !Number.isNaN(latNum) ? latNum : null,
                    longitude: !Number.isNaN(lonNum) ? lonNum : null,
                    status: u.status,
                    submitAttend: u.submitAttend,
                    deleted: u.deleted,
                    created_at: u.created_at,
                    image: imageDataUrl,
                };
            });

            return res.status(200).json(users);
        } catch (err) {
            console.error("getUserData error:", err);
            return res
                .status(500)
                .json({ message: "Server error fetching user data." });
        }
    },

    // Update status: use decrypted IC to find user, update by ID
    updateUserStatus: async (req, res) => {
        const { ic, status } = req.body;

        try {
            const rows = await UserModel.getUserData(); 
            const users = rows.map((u) => ({
                ...u,
                icPlain: safeDecrypt(u.ic),
            }));

            const user = users.find(
                (u) => normalizeIc(u.icPlain) === normalizeIc(ic)
            );

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.deleted) {
                return res
                    .status(400)
                    .json({ message: "User is deleted/disabled" });
            }

            const result = await UserModel.updateUserStatusById(
                user.id,
                status
            );

            if (result.affectedRows > 0) {
                return res
                    .status(200)
                    .json({ message: "User status updated successfully" });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.error("Error updating user status:", error);
            return res.status(500).json({
                message:
                    "Error updating user status: " + (error.message || ""),
            });
        }
    },

    // Increment submitAttend: uses decrypted IC to find user, update by ID
    incrementSubmitAttend: async (req, res) => {
        const { ic } = req.body;

        try {
            const rows = await UserModel.getUserData();
            const users = rows.map((u) => ({
                ...u,
                icPlain: safeDecrypt(u.ic),
            }));

            const user = users.find(
                (u) => normalizeIc(u.icPlain) === normalizeIc(ic)
            );

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.deleted) {
                return res
                    .status(400)
                    .json({ message: "User is deleted/disabled" });
            }

            if (user.submitAttend >= 3) {
                return res
                    .status(400)
                    .json({ message: "Maximum submit attempts reached" });
            }

            const result = await UserModel.incrementSubmitAttendById(user.id);

            if (result.affectedRows > 0) {
                return res
                    .status(200)
                    .json({ message: "SubmitAttend updated successfully" });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.error("Error incrementing submitAttend:", error);
            return res.status(500).json({
                message:
                    "Error incrementing submitAttend: " +
                    (error.message || ""),
            });
        }
    },

    // deletion: soft-delete user by ID
    softDeleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            await UserModel.softDeleteUser(id);
            return res.status(200).json({ message: "User soft-deleted." });
        } catch (err) {
            console.error("softDeleteUser error:", err);
            return res
                .status(500)
                .json({ message: "Server error deleting user." });
        }
    },

    // add user: enter all fields + image, encrypt all sensitive data
    createUser: async (req, res) => {
        try {
            const { ic, username, address, latitude, longitude } = req.body;
            const file = req.file;

            if (!ic || !username || !address || !latitude || !longitude || !file) {
                return res
                    .status(400)
                    .json({ message: "All fields and image are required." });
            }

            const encIc = encrypt(ic);
            const encAddress = encrypt(address);
            const encLat = encrypt(latitude);
            const encLon = encrypt(longitude);

            const base64Image = file.buffer.toString("base64");
            const encImage = encrypt(base64Image);

            await UserModel.createUser({
                ic: encIc,
                username,
                address: encAddress,
                latitude: encLat,
                longitude: encLon,
                imageEncryptedBase64: encImage,
                status: "red",
                submitAttend: 0,
            });

            return res
                .status(201)
                .json({ message: "User created successfully." });
        } catch (err) {
            console.error("Create user error:", err);
            return res
                .status(500)
                .json({ message: "Server error while creating user." });
        }
    },
};

module.exports = UserController;
