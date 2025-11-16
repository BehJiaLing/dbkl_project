const crypto = require("crypto");

// 32-byte key for AES-256; store in .env as base64 or hex
const ENCRYPTION_KEY = Buffer.from(process.env.ENC_KEY, "base64"); // 32 bytes
const IV_LENGTH = 16; // AES block size

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    // store iv and data together
    return iv.toString("base64") + ":" + encrypted;
}

function decrypt(enc) {
    const [ivStr, data] = enc.split(":");
    const iv = Buffer.from(ivStr, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(data, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

module.exports = { encrypt, decrypt };
