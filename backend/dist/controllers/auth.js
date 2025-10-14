"use strict";

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ✅ REGISTER
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phoneNumber } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ name, email, password, phoneNumber });
    await user.save();

    console.log("✅ DEBUG - Saved user password:", user.password);

    const token = user.getSignedJwtToken();
    return res.status(201).json({
        success: true,
        token,
        user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        },
    });
    } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server Error" });
    }
};

// ✅ LOGIN
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }

    const { email, phoneNumber, password } = req.body;

    if (!email && !phoneNumber) {
    return res.status(400).json({ message: "Please provide email or phone number" });
    }

    try {
    const query = {};
    if (email) query.email = email.toLowerCase();
    else if (phoneNumber) query.phoneNumber = phoneNumber;

    const user = await User.findOne(query).select("+password");
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials (user not found)" });
    }

    // ✅ Recovery: hash plain-text password if stored unhashed.
    if (user.password && !user.password.startsWith("$2a$")) {
        console.warn("⚠️ Detected unhashed password — hashing now for safety");
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        console.log("⚠️ Password mismatch for user:", email || phoneNumber);
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = user.getSignedJwtToken();
    res.status(200).json({
        success: true,
        token,
        user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        paymentMethods: user.paymentMethods,
    },
    });
    } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server Error" });
    }
};

// ✅ GET CURRENT USER
exports.getMe = async (req, res) => {
    try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
    } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server Error" });
    }
};

// ✅ UPDATE DETAILS
exports.updateDetails = async (req, res) => {
    try {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
    };
    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({ success: true, data: user });
    } catch (err) {
    console.error("Update details error:", err);
    res.status(500).json({ message: "Server Error" });
    }
};

// ✅ UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
    try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch)
        return res.status(401).json({ message: "Password is incorrect" });

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({ success: true });
    } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Server Error" });
    }
};
