"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowRight, Users, Star, MessageCircle } from "lucide-react"

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Exchange Skills, Build Community</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect with people in your area to swap skills and learn something new. Teach what you know, learn what you
          need.
        </p>
        {!user ? (
          <div className="space-x-4">
            <Link
  to="/register"
  className="text-white text-lg font-semibold px-8 py-3 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition duration-200 shadow-md"
>
  Start Now!
</Link>

            <Link to="/login" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        ) : (
          <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
            Go to Dashboard
            <ArrowRight className="ml-2 inline" size={20} />
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 py-16">
        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-primary-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Build Your Profile</h3>
    <p className="text-gray-600">Showcase your skills, interests, and what you're looking to learn</p>
        </div>
        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-primary-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Request Swaps</h3>
          <p className="text-gray-600">Send swap requests and negotiate mutually beneficial skill exchanges</p>
        </div>
        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-primary-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Rate & Review</h3>
          <p className="text-gray-600">Build trust in the community through ratings and feedback</p>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-lg shadow-lg p-8 my-16">
        <h2 className="text-3xl font-bold text-center mb-12">Getting Started</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-primary-500 text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h4 className="font-semibold mb-2">Create Profile</h4>
            <p className="text-sm text-gray-600">List your skills and what you want to learn</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-500 text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h4 className="font-semibold mb-2">Browse & Connect</h4>
            <p className="text-sm text-gray-600">Find people with complementary skills</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-500 text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h4 className="font-semibold mb-2">Exchange Skills</h4>
            <p className="text-sm text-gray-600">Meet up and teach each other</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-500 text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              4
            </div>
            <h4 className="font-semibold mb-2">Rate Experience</h4>
            <p className="text-sm text-gray-600">Leave feedback to help the community</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
