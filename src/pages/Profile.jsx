"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import { MapPin, MessageCircle } from "lucide-react"
import UserRating from "../components/UserRating"
import FeedbackDisplay from "../components/FeedbackDisplay"
import toast from "react-hot-toast"

const UserProfile = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (id) {
      fetchUserProfile()
      fetchUserFeedback()
    }
  }, [id])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/users/${id}`)
      setUser(response.data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchUserFeedback = async () => {
    try {
      const response = await api.get(`/users/${id}/feedback`)
      setFeedback(response.data)
    } catch (error) {
      console.error("Error fetching user feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendSwapRequest = async () => {
    try {
      await api.post("/swaps/request", { targetUserId: id })
      toast.success("Swap request sent!")
    } catch (error) {
      console.error("Error sending swap request:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-2xl">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.location && (
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin size={16} className="mr-1" />
                  {user.location}
                </p>
              )}
              <div className="mt-2">
                <UserRating rating={user.averageRating} totalRatings={user.totalRatings} size="md" />
              </div>
            </div>
          </div>
          <button onClick={sendSwapRequest} className="btn-primary flex items-center">
            <MessageCircle size={16} className="mr-2" />
            Request Swap
          </button>
        </div>

        {user.bio && <p className="text-gray-700 mt-4 p-4 bg-gray-50 rounded-lg">{user.bio}</p>}

        {user.availability && (
          <div className="mt-4">
            <span className="text-sm font-medium text-gray-700">Available: </span>
            <span className="text-sm text-gray-600">{user.availability}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "profile" ? "bg-primary-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Skills
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "feedback" ? "bg-primary-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Reviews ({feedback.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Skills Offered */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-green-700">Can Teach</h3>
            {user.skillsOffered && user.skillsOffered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.map((skill, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills listed</p>
            )}
          </div>

          {/* Skills Wanted */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Wants to Learn</h3>
            {user.skillsWanted && user.skillsWanted.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skillsWanted.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills listed</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "feedback" && (
        <div className="space-y-4">
          {feedback.length > 0 ? (
            feedback.map((review, index) => <FeedbackDisplay key={index} feedback={review} showReviewer={false} />)
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-500">No reviews yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserProfile
