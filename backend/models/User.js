const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    auditsUsedToday: {
      type: Number,
      default: 0,
    },
    usageDate: {
      type: String,
      default: null,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);