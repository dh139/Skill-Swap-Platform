"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

import { 
  Search, 
  MapPin, 
  MessageCircle, 
  BookOpen, 
  Lightbulb, 
  Users, 
  Mail, 
  Star,
  Filter,
  Grid,
  List,
  ChevronDown,
  Calendar,
  Award,
  Zap,
  ArrowUpRight,
  Heart,
  User,
  Loader2
} from "lucide-react"
import toast from "react-hot-toast"
import UserRating from "../components/UserRating"
import { Link } from "react-router-dom"

const Browse = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [locationFilter, setLocationFilter] = useState("")
  const [skillFilter, setSkillFilter] = useState("")
  const [hoveredCard, setHoveredCard] = useState(null)
  // Add loading states for swap requests
  const [swapRequestLoading, setSwapRequestLoading] = useState(new Set())

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [searchTerm, users, sortBy, locationFilter, skillFilter])

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/browse")
      console.log("Full API response:", response.data) // Debug log
      
      // Fix: Check if response.data has a users array, otherwise use response.data directly
      const usersData = response.data.users || response.data
      
      // Ensure usersData is an array
      if (Array.isArray(usersData)) {
        setUsers(usersData)
        console.log("Users data set:", usersData) // Debug log
      } else {
        console.error("Users data is not an array:", usersData)
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortUsers = () => {
    let filtered = [...users]

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((user) => {
        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.location?.toLowerCase().includes(searchLower) ||
          user.skillsOffered?.some((skill) => skill.toLowerCase().includes(searchLower)) ||
          user.skillsWanted?.some((skill) => skill.toLowerCase().includes(searchLower))
        )
      })
    }

    if (locationFilter) {
      filtered = filtered.filter(user => 
        user.location?.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    if (skillFilter) {
      filtered = filtered.filter(user => 
        user.skillsOffered?.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        ) ||
        user.skillsWanted?.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      )
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0)
        case "name":
          return a.name.localeCompare(b.name)
        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
    })

    setFilteredUsers(filtered)
  }

  const sendSwapRequest = async (targetUserId) => {
    // Add user to loading set
    setSwapRequestLoading(prev => new Set(prev).add(targetUserId))
    
    try {
      await api.post("/swaps/request", { targetUserId })
      toast.success("Swap request sent! 🚀")
    } catch (error) {
      toast.error("Failed to send request")
      console.error("Error sending swap request:", error)
    } finally {
      // Remove user from loading set
      setSwapRequestLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(targetUserId)
        return newSet
      })
    }
  }

  const getUniqueLocations = () => {
    return users
      .map(user => user.location)
      .filter(Boolean)
      .filter((location, index, arr) => arr.indexOf(location) === index)
      .slice(0, 15)
  }

  const getPopularSkills = () => {
    const allSkills = users
      .flatMap(user => [...(user.skillsOffered || []), ...(user.skillsWanted || [])])
      .filter(Boolean)
    
    const skillCount = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([skill]) => skill)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-8"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding amazing people...</h2>
            <p className="text-gray-600">Discovering the best skill swappers for you</p>
          </div>
        </div>
      </div>
    )
  }

  const UserCard = ({ user, index }) => {
    const isSwapLoading = swapRequestLoading.has(user._id)
    
    return (
      <div 
        className={`group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
          hoveredCard === user._id 
            ? 'shadow-2xl shadow-black/20 ring-1 ring-black/5' 
            : 'shadow-lg hover:shadow-xl border border-gray-100'
        }`}
        onMouseEnter={() => setHoveredCard(user._id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          animationDelay: `${index * 100}ms`
        }}
      >
        {/* Card Header with Avatar */}
        <div className="relative p-8 pb-4">
          {/* Top-right rating badge */}
          {(user.averageRating || 0) > 0 ? (
            <div className="absolute top-6 right-6 flex items-center space-x-1 bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium">
              <Star size={14} className="fill-current text-yellow-400" />
              <span>{user.averageRating.toFixed(1)}</span>
            </div>
          ) : (
            <div className="absolute top-6 right-6 flex items-center space-x-1 bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium">
              <Star size={14} className="text-gray-400" />
              <span>No Ratings</span>
            </div>
          )}
          
          {/* Avatar and Basic Info */}
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-2xl">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {user.availability && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 group-hover/link:text-black truncate">
                {user.name || 'Unknown User'}
              </h3>
              
              {/* Email - Fixed with better display logic */}
              {user.email && (
                <div className="flex items-center space-x-2 mt-2 group/email cursor-pointer">
                  <Mail size={16} className="text-gray-500 group-hover/email:text-black transition-colors flex-shrink-0" />
                  <span className="text-gray-700 group-hover/email:text-black transition-colors font-medium truncate text-sm">
                    {user.email}
                  </span>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-center space-x-2 mt-2">
                  <MapPin size={16} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-600 truncate text-sm">{user.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="px-8 pb-4">
            <p className="text-gray-700 leading-relaxed line-clamp-2 text-sm">
              {user.bio}
            </p>
          </div>
        )}

        {/* Skills Section */}
        <div className="px-8 pb-6 space-y-4">
          {/* Skills I Can Teach */}
          {user.skillsOffered && user.skillsOffered.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Can Teach</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-xs font-medium rounded-full transition-all duration-200 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
                {user.skillsOffered.length > 4 && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-500 text-xs font-medium rounded-full">
                    +{user.skillsOffered.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Skills I Want to Learn */}
          {user.skillsWanted && user.skillsWanted.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Wants to Learn</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.skillsWanted.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-xs font-medium rounded-full transition-all duration-200 cursor-default border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
                {user.skillsWanted.length > 4 && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-500 text-xs font-medium rounded-full border border-gray-200">
                    +{user.skillsWanted.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer with Loading State */}
        <div className="px-8 pb-8">
          <button
            onClick={() => sendSwapRequest(user._id)}
            disabled={isSwapLoading}
            className={`w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 group/btn ${
              hoveredCard === user._id && !isSwapLoading ? 'transform -translate-y-1 shadow-lg' : ''
            }`}
          >
            {isSwapLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Sending Request...</span>
              </>
            ) : (
              <>
                <MessageCircle size={20} className="group-hover/btn:rotate-12 transition-transform duration-200" />
                <span>Request Swap</span>
                <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></div>
              </>
            )}
          </button>
        </div>

        {/* Hover overlay effect */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl`}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Discover
            <span className="block text-black bg-gradient-to-r from-black to-gray-800 bg-clip-text text-transparent">
              Skill Masters
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with extraordinary people, exchange expertise, and unlock new possibilities together
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
              <input
                type="text"
                placeholder="Search by name, email, location, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 border-2 border-gray-200 hover:border-gray-300 focus:border-black rounded-2xl focus:outline-none transition-all duration-200 text-lg placeholder-gray-500"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center justify-center space-x-3 px-8 py-4 border-2 border-gray-200 hover:border-black hover:bg-black hover:text-white rounded-2xl transition-all duration-200 font-semibold"
            >
              <Filter size={20} />
              <span>Advanced Filters</span>
              <ChevronDown size={18} className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* View Toggle */}
            <div className="flex border-2 border-gray-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-4 transition-all duration-200 ${
                  viewMode === "grid" 
                    ? 'bg-black text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-4 transition-all duration-200 ${
                  viewMode === "list" 
                    ? 'bg-black text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          {filterOpen && (
            <div className="mt-8 pt-8 border-t-2 border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 hover:border-gray-300 focus:border-black rounded-2xl focus:outline-none transition-all duration-200 font-medium"
                >
                  <option value="newest">Newest Members</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 hover:border-gray-300 focus:border-black rounded-2xl focus:outline-none transition-all duration-200 font-medium"
                >
                  <option value="">All Locations</option>
                  {getUniqueLocations().map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Skills</label>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 hover:border-gray-300 focus:border-black rounded-2xl focus:outline-none transition-all duration-200 font-medium"
                >
                  <option value="">All Skills</option>
                  {getPopularSkills().map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredUsers.length === 0 ? 'No matches found' : `${filteredUsers.length} amazing ${filteredUsers.length === 1 ? 'person' : 'people'}`}
            </h2>
            <p className="text-gray-600 mt-1">
              {(searchTerm || locationFilter || skillFilter) ? 'Matching your search criteria' : 'Ready to share their expertise'}
            </p>
          </div>
          
          {(searchTerm || locationFilter || skillFilter) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setLocationFilter('')
                setSkillFilter('')
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-black hover:text-white rounded-2xl font-semibold transition-all duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 text-center py-20 px-8">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Users size={64} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No skill swappers found</h3>
            <p className="text-gray-600 text-lg max-w-lg mx-auto mb-8 leading-relaxed">
              Don't worry! Try adjusting your search terms, or be the first to add these skills to your profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setLocationFilter('')
                  setSkillFilter('')
                }}
                className="px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-semibold transition-all duration-200"
              >
                Show All People
              </button>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
              : "grid grid-cols-1 lg:grid-cols-2 gap-6"
          }>
            {filteredUsers.map((user, index) => (
              <UserCard key={user._id} user={user} index={index} />
            ))}
          </div>
        )}

        {/* Load More Section */}
        {filteredUsers.length >= 20 && (
          <div className="text-center mt-16">
            <button className="px-12 py-4 bg-white hover:bg-black hover:text-white border-2 border-gray-200 hover:border-black rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Discover More People
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Browse