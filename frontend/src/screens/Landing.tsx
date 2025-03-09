import { ArrowRight, Award, Clock, Users } from "lucide-react"
import Navbar from "../components/Navbar"
import "../index.css"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react";

export function Landing() {
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const token = query.get("token");

    useEffect(() => { 
        console.log("token", token)
        if(token) {
            localStorage.setItem("token", token || "");
        }
        
    })


  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* <img
            src="/placeholder.svg?height=600&width=600"
            alt="Chess pattern background"
            className="object-cover w-full h-full"
          /> */}
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-up">
                Master the Game of <span className="text-amber-400">Kings</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl animate-fade-in-up animation-delay-200">
                Experience chess like never before with our beautiful interface, powerful tools, and global community of
                players.
              </p>
              <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start animate-fade-in-up animation-delay-400">
                <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    onClick={() => {
                        navigate("/game-online")
                    }}
                >
                  Play Online <ArrowRight className="h-5 w-5" />
                </button>
                <button className="px-8 py-3 bg-transparent hover:bg-white/10 border border-white/30 rounded-lg transition-all duration-300"
                  onClick={() => {
                    navigate("/game-bot")
                  }}>
                  Play vs BOT
                </button>
              </div>
            </div>

            <div className="flex-1 animate-float">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-xl transform -rotate-6"></div>
                <img
                  src="./chessboard.png"
                  alt="Chess board"
                  className="relative rounded-2xl shadow-2xl transform rotate-3 transition-transform hover:rotate-0 duration-500 w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose Our <span className="text-amber-400">Chess Platform</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-10 w-10 text-amber-400" />,
                title: "Global Community",
                description:
                  "Connect with players from around the world and test your skills against diverse opponents.",
              },
              {
                icon: <Clock className="h-10 w-10 text-amber-400" />,
                title: "Smooth Gameplay",
                description:
                  "Enjoy a lag-free experience with our optimized game engine designed for seamless play on any device.",
              },
              {
                icon: <Award className="h-10 w-10 text-amber-400" />,
                title: "Multiple Time Controls",
                description: "From bullet to classical, play at your preferred pace with customizable time settings.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-700/50 p-8 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2 border border-gray-600"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make Your Move?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of chess enthusiasts and start your journey today.
          </p>
          <button className="px-8 py-3 hover:bg-white/30 bg-white/20 border border-white/30 rounded-lg transition-all duration-300 hover:scale-105"
            onClick={() => {
              navigate("/signin")
            }}
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to={"/"}><img src="/chess-logo.png" width={150} alt="Logo" /></Link>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-amber-400 transition-colors">
                About
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">© {new Date().getFullYear()} Chess Game. All rights reserved.</div>
        </div>
      </footer>
    </main>
  )
}

