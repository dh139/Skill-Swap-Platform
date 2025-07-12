import mongoose from "mongoose"

const swapSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    skillsRequested: [
      {
        type: String,
        trim: true,
      },
    ],
    skillsOffered: [
      {
        type: String,
        trim: true,
      },
    ],
    scheduledDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 500,
      },
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Swap", swapSchema)
