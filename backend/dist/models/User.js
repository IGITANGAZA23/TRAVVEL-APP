"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin", "staff"],
    default: "user",
  },
  phoneNumber: {
    type: String,
    maxlength: [20, "Phone number cannot be longer than 20 characters"],
  },
  paymentMethods: [
    {
      type: {
        type: String,
        enum: ["mtn_mobile_money", "airtel_money", "mastercard", "visa"],
        required: true,
      },
      identifier: {
        type: String,
        required: true,
        trim: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//
// ✅ Pre-save hook — hashes password safely.
//
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

//
// ✅ Generate signed JWT.
//
UserSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in environment variables");
  }

  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

//
// ✅ Compare entered password with hashed one.
//
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
