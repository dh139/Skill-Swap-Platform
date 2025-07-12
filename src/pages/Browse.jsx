"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import { Search, MapPin, MessageCircle, BookOpen, Lightbulb, Users } from "lucide-react" // Added more icons
import toast from "react-hot-toast"
import UserRating from "../components/UserRating"
import { Link } from "react-router-dom"

const Browse = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/browse")
      setUsers(response.data)
      setFilteredUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const searchLower = searchTerm.toLowerCase()
    const filtered = users.filter((user) => {
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.location?.toLowerCase().includes(searchLower) ||
        user.skillsOffered?.some((skill) => skill.toLowerCase().includes(searchLower)) ||
        user.skillsWanted?.some((skill) => skill.toLowerCase().includes(searchLower))
      )
    })
    setFilteredUsers(filtered)
  }

  const sendSwapRequest = async (targetUserId) => {
    try {
      await api.post("/swaps/request", { targetUserId })
      toast.success("Swap request sent!")
    } catch (error) {
      console.error("Error sending swap request:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Skill Swappers</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, location, or skills (e.g., 'React', 'New York', 'Photography')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="card text-center py-16 flex flex-col items-center justify-center">
          <Users size={48} className="text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 font-semibold mb-2">No users found.</p>
          <p className="text-gray-500 max-w-md">
            Try adjusting your search terms or check back later as more users join the platform!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="card p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold text-2xl">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="ml-4 flex-grow">
                  <Link
                    to={`/user/${user._id}`}
                    className="font-bold text-xl text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {user.name}
                  </Link>
                  {user.location && (
                    <p className="text-gray-600 text-sm flex items-center mt-1">
                      <MapPin size={14} className="mr-1 text-gray-500" />
                      {user.location}
                    </p>
                  )}
                </div>
              </div>

              {user.bio && <p className="text-gray-700 text-sm mb-4 line-clamp-3">{user.bio}</p>}

              {user.skillsOffered && user.skillsOffered.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-green-700 mb-2 flex items-center">
                    <BookOpen size={16} className="mr-2" /> Can Teach:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {user.skillsOffered.length > 4 && (
                      <span className="text-gray-500 text-xs px-3 py-1">+{user.skillsOffered.length - 4} more</span>
                    )}
                  </div>
                </div>
              )}

              {user.skillsWanted && user.skillsWanted.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-blue-700 mb-2 flex items-center">
                    <Lightbulb size={16} className="mr-2" /> Wants to Learn:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {user.skillsWanted.length > 4 && (
                      <span className="text-gray-500 text-xs px-3 py-1">+{user.skillsWanted.length - 4} more</span>
                    )}
                  </div>
                </div>
              )}

              {user.availability && (
                <p className="text-gray-600 text-sm mb-4">
                  <strong className="text-gray-700">Available:</strong> {user.availability}
                </p>
              )}

              <div className="mt-auto mb-4">
                {" "}
                {/* Pushes rating and button to bottom */}
                <UserRating rating={user.averageRating} totalRatings={user.totalRatings} size="sm" />
              </div>

              <button
                onClick={() => sendSwapRequest(user._id)}
                className="w-full btn-primary flex items-center justify-center py-2.5"
              >
                <MessageCircle size={16} className="mr-2" />
                Request Swap
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Browse
