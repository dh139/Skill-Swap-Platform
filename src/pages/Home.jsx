"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowRight, Users, Star, MessageCircle } from "lucide-react"

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center py-24">
        <h1 className="text-5xl md:text-6xl font-extrabold text-black dark:text-white tracking-tight mb-6">
          Exchange Skills. <span className="text-gray-500">Grow Together.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-white/70 mb-10 max-w-3xl mx-auto">
          Connect with people in your area to swap skills and learn something new.
          Teach what you know, learn what you need.
        </p>

        {!user ? (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 text-white text-lg font-semibold rounded-2xl bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black transition-all duration-300 shadow-md hover:scale-105"
            >
              Start Now
            </Link>
            <Link
              to="/login"
              className="text-lg px-8 py-3 border border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-2xl hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 text-white bg-black px-8 py-3 rounded-2xl text-lg font-semibold transition hover:scale-105 duration-300 shadow-lg"
          >
            Go to Dashboard <ArrowRight size={20} />
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-10 py-20">
        {[
          {
            title: "Build Your Profile",
            description: "Showcase your skills, interests, and what you're looking to learn.",
            icon: <Users size={32} className="text-black dark:text-white" />,
          },
          {
            title: "Request Swaps",
            description: "Send swap requests and negotiate mutually beneficial skill exchanges.",
            icon: <MessageCircle size={32} className="text-black dark:text-white" />,
          },
          {
            title: "Rate & Review",
            description: "Build trust in the community through ratings and feedback.",
            icon: <Star size={32} className="text-black dark:text-white" />,
          },
        ].map(({ title, description, icon }, index) => (
          <div
            key={index}
            className="text-center p-6 bg-white dark:bg-white/10 rounded-3xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
              {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-white/70">{description}</p>
          </div>
        ))}
      </section>

      {/* How It Works Section */}
      <section className="bg-white dark:bg-white/5 rounded-3xl shadow-lg p-10 my-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 tracking-tight">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { step: "1", title: "Create Profile", desc: "List your skills and what you want to learn." },
            { step: "2", title: "Browse & Connect", desc: "Find people with complementary skills." },
            { step: "3", title: "Exchange Skills", desc: "Meet up and teach each other." },
            { step: "4", title: "Rate Experience", desc: "Leave feedback to help the community." },
          ].map(({ step, title, desc }, index) => (
            <div key={index}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                {step}
              </div>
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{title}</h4>
              <p className="text-sm text-gray-600 dark:text-white/70">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
