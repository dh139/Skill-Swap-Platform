import mongoose from "mongoose"

const platformMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
)

export default mongoose.model("PlatformMessage", platformMessageSchema)
