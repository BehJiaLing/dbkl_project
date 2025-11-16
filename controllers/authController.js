const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const AuthModel = require('../models/authModel');

// env variables you should set:
// process.env.JWT_SECRET
// process.env.CLIENT_URL (e.g. http://localhost:3000)
// process.env.EMAIL_USER, process.env.EMAIL_PASS (or SMTP config)

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const AuthController = {
    signup: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            if (!strongPasswordRegex.test(password)) {
                return res.status(400).json({
                    message:
                        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
                });
            }

            const domain = email.split('@')[1];

            let role;
            if (domain === 'student.newinti.edu.my') {
                role = 'admin';
            } else if (domain === 'employer.newinti.edu.my') {
                role = 'employer';
            } else {
                return res.status(400).json({
                    message:
                        'Email domain is not allowed. Use @student.newinti.edu.my or @employer.newinti.edu.my.'
                });
            }

            const existingUser = await AuthModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already registered.' });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const verificationToken = crypto.randomBytes(32).toString('hex');

            const userId = await AuthModel.createUser({
                username,
                email,
                passwordHash,
                role,
                verificationToken
            });

            const verifyLink = `${process.env.SERVER_URL}/api/auth/verify-email?token=${verificationToken}`;

            const mailOptions = {
                from: `"Store Rental System" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Verify your Store Rental System account",
                text: `Hello ${username},\n\nPlease verify your account by opening this link:\n${verifyLink}\n\nIf you did not request this, you can ignore this email.`,
                html: `
                    <p>Hello ${username},</p>
                    <p>Please verify your account by clicking the link below:</p>
                    <p><a href="${verifyLink}">Verify Email</a></p>
                    <p>If you did not request this, you can ignore this email.</p>
                `
            };

            await transporter.sendMail(mailOptions);

            return res.status(201).json({
                message: 'Signup successful. Please check your email to verify your account.'
            });
        } catch (err) {
            console.error('Signup error:', err);
            return res.status(500).json({ message: 'Server error during signup.' });
        }
    },

    verifyEmail: async (req, res) => {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(400).send('Invalid verification link.');
            }

            const user = await AuthModel.findByVerificationToken(token);
            if (!user) {
                return res.status(400).send('Invalid or expired verification token.');
            }

            await AuthModel.verifyUser(user.id);

            // After verifying, redirect back to frontend login page
            return res.redirect(`${process.env.CLIENT_URL}/login?verified=1`);
        } catch (err) {
            console.error('Verify email error:', err);
            return res.status(500).send('Server error during verification.');
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }

            const user = await AuthModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: "Invalid email or password." });
            }

            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid email or password." });
            }

            if (!user.is_verified) {
                return res
                    .status(403)
                    .json({ message: "Please verify your email before logging in." });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                { expiresIn: "30m" } // shorter lifetime, e.g. 30 minutes
            );

            // Set HttpOnly cookie, not readable by JS
            res.cookie("authToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // true in prod (HTTPS)
                sameSite: "strict",
                maxAge: 30 * 60 * 1000, // 30 minutes
            });

            return res.status(200).json({
                message: "Login successful.",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "Server error during login." });
        }
    },

    logout: (req, res) => {
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        return res.status(200).json({ message: "Logged out." });
    },

    requestPasswordReset: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: "Email is required." });
            }

            const user = await AuthModel.findByEmail(email);

            // IMPORTANT: don't reveal whether the email exists
            if (!user) {
                return res.status(200).json({
                    message:
                        "Can't found this account.",
                });
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await AuthModel.setResetToken(email, resetToken, expiresAt);

            const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

            const mailOptions = {
                from: `"Store Rental System" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Reset your Store Rental System password",
                text: `Hello ${user.username},\n\nYou requested to reset your password. Please open this link to reset it:\n${resetLink}\n\nIf you did not request this, you can ignore this email.`,
                html: `
                    <p>Hello ${user.username},</p>
                    <p>You requested to reset your password. Click the link below to reset it:</p>
                    <p><a href="${resetLink}">Reset Password</a></p>
                    <p>If you did not request this, you can ignore this email.</p>
                `,
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({
                message:
                    "A reset link has been sent.",
            });
        } catch (err) {
            console.error("Request password reset error:", err);
            return res
                .status(500)
                .json({ message: "Server error while requesting password reset." });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                return res
                    .status(400)
                    .json({ message: "Token and new password are required." });
            }

            if (!strongPasswordRegex.test(password)) {
                return res.status(400).json({
                    message:
                        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
                });
            }

            const user = await AuthModel.findByResetToken(token);
            if (!user) {
                return res
                    .status(400)
                    .json({ message: "Invalid or expired reset token." });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            await AuthModel.updatePasswordAndClearResetToken(user.id, passwordHash);

            return res
                .status(200)
                .json({ message: "Password has been reset successfully." });
        } catch (err) {
            console.error("Reset password error:", err);
            return res
                .status(500)
                .json({ message: "Server error while resetting password." });
        }
    },
};

module.exports = AuthController;
