// backend/src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "../models/Seller.model.js";
import Lender from "../models/Lender.model.js";
import MockCompany from "../models/MockCompany.model.js";
import MockRBIDatabase from "../models/MockRBIDatabase.model.js"; 
import Otp from "../models/Otp.model.js";
import { hashField } from "../utils/encryption.utils.js";
import { sendOtpEmail } from "../utils/email.utils.js";
import { getRandomAvatarUrl } from "../utils/avatar.utils.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const sendAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", 
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const generateOtpCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ==========================================
// SELLER AUTHENTICATION
// ==========================================

export const registerSeller = async (req, res) => {
  console.log("Seller registration started!!!");
  try {
    const { email, companyName, gstNumber } = req.body;

    console.log("Verifying company gstin...");
    const verifiedCompany = await MockCompany.findOne({ gstin: gstNumber });

    if (!verifiedCompany) {
      return res.status(400).json({ error: "Registration Failed: GSTIN not found in official Govt records." });
    }
    if (verifiedCompany.companyName.toLowerCase() !== companyName.toLowerCase()) {
      return res.status(400).json({ error: `Registration Failed: GSTIN belongs to '${verifiedCompany.companyName}', not '${companyName}'.` });
    }

    console.log("GST company verification done!");
    const gstHash = hashField(gstNumber);

    const sellerExists = await Seller.findOne({ email });
    if (sellerExists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const isGstNumDuplicate = await Seller.findOne({ gstHash: gstHash });
    if (isGstNumDuplicate) {
      return res.status(400).json({ error: "GST Number already registered" });
    }

    // ✅ VALIDATION PASSED. SEND OTP (Do NOT create user or send cookie yet)
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await Otp.deleteMany({ email, purpose: "register", verified: false });
    await Otp.create({ email, code, purpose: "register", expiresAt });
    await sendOtpEmail({ to: email, code });

    return res.status(200).json({ message: "Validation passed. OTP sent to email." });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });

    if (seller && (await seller.matchPassword(password))) {
      // ✅ PASSWORD CORRECT. SEND OTP (Do NOT send cookie yet)
      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      await Otp.deleteMany({ email, purpose: "login", verified: false });
      await Otp.create({ email, code, purpose: "login", expiresAt });
      await sendOtpEmail({ to: email, code });

      res.status(200).json({ message: "Password verified. OTP sent to email." });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ==========================================
// LENDER AUTHENTICATION
// ==========================================

export const registerLender = async (req, res) => {
  try {
    const { email, password, companyName, gstNumber, lenderType, lenderLicense } = req.body;

    if (!email || !password || !companyName || !lenderType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🛡️ WALL 3: RBI REGULATORY SHIELD
    if (["Bank", "NBFC", "Institutional"].includes(lenderType)) {
      if (!lenderLicense || !gstNumber) {
        return res.status(400).json({ error: "Corporate lenders must provide a GSTIN and an RBI License Number." });
      }

      console.log(`🔍 Verifying RBI License for: ${lenderLicense}`);
      const rbiRecord = await MockRBIDatabase.findOne({ licenseNumber: lenderLicense });

      if (!rbiRecord) return res.status(400).json({ error: "Verification Failed: RBI License Number not found." });
      if (rbiRecord.status !== "Active") return res.status(403).json({ error: `Regulatory Alert: License '${rbiRecord.status}'. Blocked.` });
      if (rbiRecord.gstin.toLowerCase() !== gstNumber.toLowerCase()) return res.status(400).json({ error: "Verification Failed: GSTIN mismatch." });

      console.log("✅ RBI Verification Passed!");
    }

    const lenderExists = await Lender.findOne({ email });
    if (lenderExists) return res.status(400).json({ error: "Email already registered as Lender" });

    if (gstNumber) {
      const gstHash = hashField(gstNumber);
      const isGstNumDuplicate = await Lender.findOne({ gstHash });
      if (isGstNumDuplicate) return res.status(400).json({ error: "GST Number already registered to another Lender" });
    }

    // ✅ VALIDATION PASSED. SEND OTP (Do NOT create user or send cookie yet)
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await Otp.deleteMany({ email, purpose: "register", verified: false });
    await Otp.create({ email, code, purpose: "register", expiresAt });
    await sendOtpEmail({ to: email, code });

    return res.status(200).json({ message: "Validation passed. OTP sent to email." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginLender = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lender = await Lender.findOne({ email });

    if (lender && (await lender.comparePassword(password))) {
      // ✅ PASSWORD CORRECT. SEND OTP (Do NOT send cookie yet)
      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      await Otp.deleteMany({ email, purpose: "login", verified: false });
      await Otp.create({ email, code, purpose: "login", expiresAt });
      await sendOtpEmail({ to: email, code });

      res.status(200).json({ message: "Password verified. OTP sent to email." });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ==========================================
// OTP VERIFICATION & USER CREATION
// ==========================================

export const requestOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !purpose) return res.status(400).json({ error: "Email and purpose are required" });

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email, purpose, verified: false });
    await Otp.create({ email, code, purpose, expiresAt });
    await sendOtpEmail({ to: email, code });

    res.json({ message: "OTP sent to email", email, purpose });
  } catch (error) {
    console.error("OTP request error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, code, purpose, mode } = req.body;

    let payload = null;
    if (req.body.payload) {
      if (typeof req.body.payload === "object") {
        payload = req.body.payload;
      } else {
        try {
          payload = JSON.parse(req.body.payload);
        } catch (e) {
          return res.status(400).json({ error: "Invalid payload format" });
        }
      }
    }

    const avatarFile = req.file;

    if (!email || !code || !purpose || !mode) {
      return res.status(400).json({ error: "Missing required verification fields" });
    }

    const otpDoc = await Otp.findOne({ email, code, purpose, verified: false });
    if (!otpDoc) return res.status(400).json({ error: "Invalid or expired OTP" });
    if (otpDoc.expiresAt < new Date()) return res.status(400).json({ error: "OTP has expired" });

    otpDoc.verified = true;
    await otpDoc.save();

    let user;
    let role = mode;

    if (purpose === "register") {
      const avatarUrl = avatarFile ? `/uploads/avatars/${avatarFile.filename}` : getRandomAvatarUrl();

      if (mode === "seller") {
        const { password, companyName, gstNumber, businessType, industry, annualTurnover } = payload || {};
        const gstHash = hashField(gstNumber);

        user = await Seller.create({
          email: email, // Secure: forces the exact email that received the OTP
          password,
          companyName,
          gstNumber,
          gstHash,
          businessType: businessType || "Services",
          industry: industry || "IT",
          annualTurnover: Number(annualTurnover) || 0,
          isOnboarded: false,
          kycStatus: "partial",
          avatarUrl,
        });
      } else if (mode === "lender") {
        const { password, companyName, lenderType, lenderLicense, gstNumber } = payload || {};
        let gstHash = gstNumber ? hashField(gstNumber) : undefined;

        user = await Lender.create({
          email: email, // Secure: forces the exact email that received the OTP
          password,
          companyName,
          gstNumber: gstNumber || undefined,
          gstHash: gstHash,
          lenderType,
          lenderLicense: lenderLicense || undefined,
          isOnboarded: false,
          kycStatus: "partial",
          totalCreditLimit: 0,
          utilizedLimit: 0,
          walletBalance: 0,
          avatarUrl,
        });
      }
    } else if (purpose === "login") {
      if (mode === "seller") {
        user = await Seller.findOne({ email });
      } else {
        user = await Lender.findOne({ email });
      }

      if (!user) return res.status(400).json({ error: "Account not found" });

      if (!user.avatarUrl) {
        user.avatarUrl = getRandomAvatarUrl();
        await user.save();
      }
    }

    // ✅ OTP IS VERIFIED & USER IS CREATED/FOUND. NOW ISSUE COOKIE.
    const token = generateToken(user._id, role);
    sendAuthCookie(res, token);

    return res.json({
      _id: user._id,
      email: user.email,
      companyName: user.companyName,
      role,
      avatarUrl: user.avatarUrl || "",
      isOnboarded: user.isOnboarded,
      kycStatus: user.kycStatus,
      message: purpose === "register" ? "Registration complete." : "Login verified",
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "An unexpected error occurred during OTP verification." });
  }
};

// ==========================================
// USER UTILITIES & SETTINGS
// ==========================================

export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    res.json({
      _id: req.user._id,
      email: req.user.email,
      companyName: req.user.companyName,
      role: req.user.businessType ? "seller" : "lender",
      avatarUrl: req.user.avatarUrl || "",
      isOnboarded: req.user.isOnboarded,
      kycStatus: req.user.kycStatus,
      trustScore: req.user.trustScore || 300,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching user" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const { companyName, email, annualTurnover, password } = req.body;

    let updateData = {
      companyName,
      email,
      annualTurnover: Number(annualTurnover) || 0,
    };

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    let updatedUser;
    if (req.user.businessType) {
      updatedUser = await Seller.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password");
    } else {
      updatedUser = await Lender.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password");
    }

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      companyName: updatedUser.companyName,
      role: req.user.businessType ? "seller" : "lender",
      avatarUrl: updatedUser.avatarUrl || "",
      isOnboarded: updatedUser.isOnboarded,
      kycStatus: updatedUser.kycStatus,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile details" });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const avatarFile = req.file;
    if (!avatarFile) return res.status(400).json({ error: "No image file provided" });

    const newAvatarUrl = `/uploads/avatars/${avatarFile.filename}`;
    let updatedUser;

    if (req.user.businessType) {
      updatedUser = await Seller.findByIdAndUpdate(req.user._id, { avatarUrl: newAvatarUrl }, { new: true }).select("-password");
    } else {
      updatedUser = await Lender.findByIdAndUpdate(req.user._id, { avatarUrl: newAvatarUrl }, { new: true }).select("-password");
    }

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      companyName: updatedUser.companyName,
      avatarUrl: updatedUser.avatarUrl,
      message: "Avatar updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update avatar" });
  }
};