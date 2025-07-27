"use client"

import { useState, useEffect } from "react"
import { Star, X } from "lucide-react"
import api from "../services/api"
import toast from "react-hot-toast"

const StarButton = ({ filled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-1 transition-colors focus:outline-none ${
      filled ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
    }`}
    aria-label={`Rate ${filled ? "filled" : "empty"} star`}
  >
    <Star size={24} fill="currentColor" />
  </button>
)

const FeedbackModal = ({ swap, isOpen, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState({ rating: 5, comment: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFeedback({ rating: 5, comment: "" })
    }
  }, [isOpen, swap])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/swaps/${swap._id}/feedback`, feedback)
      toast.success("Feedback submitted successfully!")
      onSubmit()
      onClose()
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Failed to submit feedback.")
    } finally {
      setLoading(false)
    }
  }

  const handleRatingClick = (rating) => {
    setFeedback((prev) => ({ ...prev, rating }))
  }

  if (!isOpen || !swap) return null

  const otherUserName = swap?.requester?.name || swap?.target?.name || "this user"
  const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Heading */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Rate Your Experience</h3>
        <p className="text-gray-600 mb-6">
          How was your skill swap with <span className="font-medium">{otherUserName}</span>?
        </p>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarButton key={star} filled={star <= feedback.rating} onClick={() => handleRatingClick(star)} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{ratingLabels[feedback.rating - 1]}</p>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              id="feedback-comment"
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              rows="4"
              placeholder="Share your experience with this skill swap..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{feedback.comment.length}/500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md w-full sm:w-auto transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md w-full sm:w-auto transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackModal
