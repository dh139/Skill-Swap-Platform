import { Star, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const FeedbackDisplay = ({ feedback, showReviewer = true }) => {
  if (!feedback) return null

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {showReviewer && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <span className="font-medium text-sm">Anonymous Review</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={`${star <= feedback.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-sm font-medium ml-1">{feedback.rating}/5</span>
        </div>
      </div>

      {feedback.comment && <p className="text-gray-700 text-sm mb-2">{feedback.comment}</p>}

      <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}</p>
    </div>
  )
}

export default FeedbackDisplay
