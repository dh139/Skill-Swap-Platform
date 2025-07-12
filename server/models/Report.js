import mongoose from "mongoose"

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportedSwap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Swap",
    },
    type: {
      type: String,
      enum: ["user", "swap", "content"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "investigating", "resolved", "dismissed"], // Added 'investigating'
      default: "pending",
    },
    adminNotes: {
      type: String,
      maxlength: 500,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Report", reportSchema)
