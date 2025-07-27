// models/Message.js
import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    swapId: { type: mongoose.Schema.Types.ObjectId, ref: "Swap", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt
)


export default mongoose.model("Message", messageSchema)
