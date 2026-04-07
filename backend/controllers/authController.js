const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const {
  resetAuditUsageIfNeeded,
  getAuditUsageData,
} = require("../utils/auditUsage");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      usageDate: new Date().toISOString().split("T")[0],
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
      },
      usage: getAuditUsageData(user),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    resetAuditUsageIfNeeded(user);
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
      },
      usage: getAuditUsageData(user),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Login failed",
    });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id || req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    resetAuditUsageIfNeeded(user);
    await user.save();

    return res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
      },
      usage: getAuditUsageData(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch user",
    });
  }
}

// forgot password functionality started here 
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        message: "If email exists, reset link sent",
      });
    }

    // generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 1000 * 60 * 15; // 15 min

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    return res.json({
      message: "Reset link sent",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// reset password functionality code here 
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // clear token
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword
};