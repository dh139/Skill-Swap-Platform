import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    location: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    skillsOffered: [
      {
        type: String,
        trim: true,
      },
    ],
    skillsWanted: [
      {
        type: String,
        trim: true,
      },
    ],
    availability: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalSwaps: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next()

  try {
    console.log("🔧 Hashing password for user:", this.email)
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    console.log("✅ Password hashed successfully")
    next()
  } catch (error) {
    console.error("❌ Password hashing error:", error)
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {


    const result = await bcrypt.compare(candidatePassword, this.password)
 
    return result
  } catch (error) {
    console.error("❌ Password comparison error:", error)
    return false
  }
}

export default mongoose.model("User", userSchema)
