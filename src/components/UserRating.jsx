"use client"

import { Star } from "lucide-react"

const UserRating = ({ rating, totalRatings, size = "sm" }) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  const starSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  // Handle cases where rating might be undefined, null, or 0
  const displayRating = rating && rating > 0 ? rating : 0
  const displayTotalRatings = totalRatings || 0

  if (displayRating === 0 || displayTotalRatings === 0) {
    return (
      <div className={`flex items-center text-gray-500 ${sizeClasses[size]}`}>
        <Star size={starSizes[size]} className="mr-1" />
        <span>No ratings yet</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <Star size={starSizes[size]} className="text-yellow-500 fill-current mr-1" />
      <span className="font-medium">{displayRating.toFixed(1)}</span>
      <span className="text-gray-500 ml-1">
        ({displayTotalRatings} review{displayTotalRatings !== 1 ? "s" : ""})
      </span>
    </div>
  )
}

export default UserRating
