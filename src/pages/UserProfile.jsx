"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import { MapPin, Mail } from "lucide-react"

const UserProfile = () => {
  const { id } = useParams()
  const { loading: authLoading } = useAuth()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return

    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`)
        setUser(res.data)
      } catch (err) {
        if (err.response?.status === 403) {
          setError("This profile is private.")
        } else if (err.response?.status === 404) {
          setError("User not found.")
        } else if (err.response?.status === 401) {
          setError("Unauthorized. Please log in.")
        } else {
          setError("Something went wrong.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id, authLoading])

  if (authLoading || loading) return <p className="text-center">Loading...</p>
  if (error) return <p className="text-center text-red-500">{error}</p>
  if (!user) return <p className="text-center">User not found</p>

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">{user.name}</h1>

      {user.email && (
        <p className="flex items-center gap-2 text-gray-600">
          <Mail size={16} /> {user.email}
        </p>
      )}

      <p className="flex items-center gap-2 text-gray-600">
        <MapPin size={16} /> {user.location || "No location specified"}
      </p>

      <p className="mt-4 text-gray-800">{user.bio || "No bio provided"}</p>

      <div className="mt-6">
        <h3 className="font-semibold text-lg">Skills Offered</h3>
        <div className="flex gap-2 flex-wrap">
          {user.skillsOffered?.length > 0 ? (
            user.skillsOffered.map((skill, i) => (
              <span key={i} className="bg-green-200 px-3 py-1 rounded-full text-sm">{skill}</span>
            ))
          ) : (
            <p className="text-gray-500">No skills listed.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg">Skills Wanted</h3>
        <div className="flex gap-2 flex-wrap">
          {user.skillsWanted?.length > 0 ? (
            user.skillsWanted.map((skill, i) => (
              <span key={i} className="bg-blue-200 px-3 py-1 rounded-full text-sm">{skill}</span>
            ))
          ) : (
            <p className="text-gray-500">No skills listed.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
