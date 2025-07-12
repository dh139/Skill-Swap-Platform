import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import dotenv from "dotenv"

dotenv.config()

async function fixAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap")
    console.log("Connected to MongoDB")

    // Delete existing admin if exists
    await User.deleteOne({ email: "admin@skillswap.com" })
    console.log("Removed existing admin user")

    // Hash the password properly
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("admin123", salt)

    // Create new admin with properly hashed password
    const admin = new User({
      name: "Admin User",
      email: "admin@skillswap.com",
      password: hashedPassword, // Use pre-hashed password
      role: "admin",
      location: "Platform",
      bio: "System Administrator",
      skillsOffered: ["Platform Management"],
      skillsWanted: [],
      availability: "Always available",
      isPublic: true,
    })

    await admin.save()

    console.log("✅ Admin user created successfully with proper password hashing!")
    console.log("Email: admin@skillswap.com")
    console.log("Password: admin123")
    console.log("Role: admin")

    // Verify the password works
    const testLogin = await admin.comparePassword("admin123")
    console.log("Password verification test:", testLogin ? "✅ PASSED" : "❌ FAILED")

    process.exit(0)
  } catch (error) {
    console.error("Error fixing admin:", error)
    process.exit(1)
  }
}

fixAdminPassword()
