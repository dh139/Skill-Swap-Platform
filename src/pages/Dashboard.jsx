"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import { Edit, Star, Clock, Users, MessageSquare } from "lucide-react"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalSwaps: 0,
    pendingRequests: 0,
    completedSwaps: 0,
    averageRating: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [platformMessages, setPlatformMessages] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchPlatformMessages() // Add this line
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([api.get("/users/stats"), api.get("/swaps/recent")])
      setStats(statsRes.data)
      setRecentActivity(activityRes.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatformMessages = async () => {
    try {
      const response = await api.get("/messages/latest")
      setPlatformMessages(response.data)
    } catch (error) {
      console.error("Error fetching platform messages:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
        <p className="text-gray-600">Here's what's happening with your skill swaps</p>
      </div>

      {/* Platform Announcements */}
      {platformMessages.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MessageSquare size={20} className="mr-2 text-primary-600" />
            Platform Announcements
          </h2>
          <div className="space-y-3">
            {platformMessages.map((msg) => (
              <div key={msg._id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-1">{msg.content}</p>
                <p className="text-xs text-blue-600">
                  Sent by {msg.sentBy?.name || "Admin"} on {new Date(msg.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="text-blue-600" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalSwaps}</h3>
          <p className="text-gray-600">Total Swaps</p>
        </div>
        <div className="card text-center">
          <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</h3>
          <p className="text-gray-600">Pending Requests</p>
        </div>
        <div className="card text-center">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="text-green-600" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.completedSwaps}</h3>
          <p className="text-gray-600">Completed Swaps</p>
        </div>
        <div className="card text-center">
          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="text-purple-600" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
          </h3>
          <p className="text-gray-600">Average Rating</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/profile")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Edit className="text-primary-600 mb-2" size={24} />
            <h3 className="font-medium">Update Profile</h3>
            <p className="text-sm text-gray-600">Add skills or update availability</p>
          </button>
          <button
            onClick={() => (window.location.href = "/browse")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Users className="text-primary-600 mb-2" size={24} />
            <h3 className="font-medium">Browse Users</h3>
            <p className="text-sm text-gray-600">Find people to swap skills with</p>
          </button>
          <button
            onClick={() => (window.location.href = "/swap-requests")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Clock className="text-primary-600 mb-2" size={24} />
            <h3 className="font-medium">View Requests</h3>
            <p className="text-sm text-gray-600">Manage your swap requests</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            No recent activity. Start by browsing users or updating your profile!
          </p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
