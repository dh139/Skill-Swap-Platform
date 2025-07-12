import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import dotenv from "dotenv"

dotenv.config()

async function debugPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap")
    console.log("Connected to MongoDB")

    // Test bcrypt directly
    console.log("\n🔍 Testing bcrypt directly:")
    const testPassword = "admin123"
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(testPassword, salt)
    console.log("Original password:", testPassword)
    console.log("Hashed password:", hashedPassword)

    const directCompare = await bcrypt.compare(testPassword, hashedPassword)
    console.log("Direct bcrypt compare result:", directCompare ? "✅ WORKS" : "❌ FAILED")

    // Check if admin exists
    const admin = await User.findOne({ email: "admin@skillswap.com" })
    if (admin) {
      console.log("\n👤 Admin user found:")
      console.log("- Stored hash:", admin.password)
      console.log("- Hash length:", admin.password.length)

      // Test the comparePassword method
      console.log("\n🔧 Testing comparePassword method:")
      try {
        const methodResult = await admin.comparePassword("admin123")
        console.log("comparePassword result:", methodResult ? "✅ WORKS" : "❌ FAILED")
      } catch (error) {
        console.log("comparePassword error:", error.message)
      }

      // Test direct bcrypt compare with stored hash
      console.log("\n🔍 Testing direct compare with stored hash:")
      const directResult = await bcrypt.compare("admin123", admin.password)
      console.log("Direct compare with stored hash:", directResult ? "✅ WORKS" : "❌ FAILED")
    }

    process.exit(0)
  } catch (error) {
    console.error("Debug error:", error)
    process.exit(1)
  }
}

debugPassword()
