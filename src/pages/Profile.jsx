import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import toast from "react-hot-toast"
import { PlusCircle, Trash2, Save, Phone } from "lucide-react"

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    location: "",
    bio: "",
    availability: "",
    isPublic: true,
  })
  const [skillsOffered, setSkillsOffered] = useState([])
  const [skillsWanted, setSkillsWanted] = useState([])
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
        location: user.location || "",
        bio: user.bio || "",
        availability: user.availability || "",
        isPublic: user.isPublic !== false,
      })
      setSkillsOffered(user.skillsOffered || [])
      setSkillsWanted(user.skillsWanted || [])
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const addSkill = (type) => {
    const newSkill = type === "offered" ? newSkillOffered.trim() : newSkillWanted.trim()
    const skills = type === "offered" ? skillsOffered : skillsWanted
    if (newSkill && !skills.includes(newSkill)) {
      type === "offered"
        ? setSkillsOffered([...skills, newSkill])
        : setSkillsWanted([...skills, newSkill])
    }
    type === "offered" ? setNewSkillOffered("") : setNewSkillWanted("")
  }

  const removeSkill = (type, skill) => {
    type === "offered"
      ? setSkillsOffered(skillsOffered.filter((s) => s !== skill))
      : setSkillsWanted(skillsWanted.filter((s) => s !== skill))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updateData = { ...formData, skillsOffered, skillsWanted }
      const response = await api.put("/users/profile", updateData)
      updateUser(response.data.user)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">Mobile Number</label>
              <div className="relative">
                <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="+1234567890"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">Bio</label>
            <textarea
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              placeholder="Tell others about yourself..."
            />
          </div>

          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">Availability</label>
            <input
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              placeholder="e.g., Weekends, Evenings"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="w-5 h-5 text-black border-gray-200 rounded focus:ring-black"
            />
            <label className="ml-2 text-sm font-medium text-gray-900">Make my profile public</label>
          </div>

          {/* Skills Offered */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">Skills I Can Offer</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {skillsOffered.map((skill, i) => (
                <span
                  key={i}
                  className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-200 hover:bg-green-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill("offered", skill)}
                    className="ml-2 hover:text-green-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={newSkillOffered}
                onChange={(e) => setNewSkillOffered(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("offered"))}
                className="bg-gray-100 border border-gray-200 flex-1 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                placeholder="Add a skill to offer"
              />
              <button
                type="button"
                onClick={() => addSkill("offered")}
                className="bg-green-500 text-white p-4 rounded-xl hover:bg-green-600 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          {/* Skills Wanted */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">Skills I Want to Learn</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {skillsWanted.map((skill, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-200 hover:bg-blue-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill("wanted", skill)}
                    className="ml-2 hover:text-blue-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={newSkillWanted}
                onChange={(e) => setNewSkillWanted(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("wanted"))}
                className="bg-gray-100 border border-gray-200 flex-1 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                placeholder="Add a skill to learn"
              />
              <button
                type="button"
                onClick={() => addSkill("wanted")}
                className="bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 focus:ring-2 focus:ring-black focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile
