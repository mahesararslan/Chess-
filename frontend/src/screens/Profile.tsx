import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Trophy, Award, BarChart2, Clock, Edit } from "lucide-react"
import axios from "axios"
import Loader from "../components/Loader"   

interface User {
  username: string
    name: string
    image: string | null
    joinDate: string
    rating: number
    stats: {
      wins: number
      draws: number
      losses: number
      totalGames: number
    }
    recentGames: {
      opponent: string
      result: string
      rating: number
      date: string
    }[]
}


function ProfilePage() {
  const navigate = useNavigate()

  // Mock user data - in a real app, this would come from your backend
  const [userData, setUserData] = useState<User>()
  const [loading, setLoading] = useState(true)
  const [totalGames, setTotalGames] = useState(0)
  const [winPercentage, setWinPercentage] = useState(0)
  

  useEffect(() => { 
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("No token found, redirecting to login");
            }
    
                axios.get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-user-data`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then((response) => {
                    setUserData(response.data);
                    setTotalGames(response.data.stats.totalGames)
                    setWinPercentage(response.data.stats.wins / response.data.stats.totalGames * 100)
                    setLoading(false)
                }).catch((error) => {
                    console.error("Error fetching user:", error);
                });
        }, []); 

  // Get first letter for avatar fallback
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // Handle go back
  const handleGoBack = () => {
    navigate("/")
  }

  if(loading) {
    return <Loader message="Loading" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="relative mb-8">
            {/* Banner */}
            <div className="h-40 rounded-t-xl bg-gradient-to-r from-amber-600 to-amber-500"></div>

            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row gap-4 p-4 -mt-12 md:-mt-16 items-center md:items-end">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-amber-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-900">
                  {userData?.image ? (
                    <img
                      src={userData.image || "/placeholder.svg"}
                      alt={userData.name[0]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitial(userData?.name || "")
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-gray-800 p-1.5 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center md:text-left flex-1 pt-2 md:pt-0">
                <h2 className="text-2xl font-bold">{userData?.name}</h2>
                <p className="text-gray-400">@{userData?.username}</p>
                <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">{userData?.rating} Rating</span>
                  <span className="text-gray-500 mx-1">•</span>
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Joined {userData?.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Game Statistics */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-amber-400" />
                Game Statistics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Win Rate</span>
                    <span className="text-sm font-medium">{winPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${winPercentage}%` }}></div>
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{totalGames}</div>
                  <div className="text-sm text-gray-400">Total Games</div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">{userData?.stats.wins}</div>
                  <div className="text-sm text-gray-400">Wins</div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-400">{userData?.stats.draws}</div>
                  <div className="text-sm text-gray-400">Draws</div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-400">{userData?.stats.losses}</div>
                  <div className="text-sm text-gray-400">Losses</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Achievements
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "First Win", icon: "🏆", unlocked: true },
                  { name: "10 Game Streak", icon: "🔥", unlocked: true },
                  { name: "Checkmate in 10", icon: "⚡", unlocked: true },
                  { name: "100 Games", icon: "🎮", unlocked: false },
                  { name: "Beat Hard Bot", icon: "🤖", unlocked: false },
                  { name: "1500 Rating", icon: "⭐", unlocked: false },
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      achievement.unlocked ? "bg-amber-500/10 border border-amber-500/30" : "bg-gray-700/50 opacity-60"
                    }`}
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <div className="font-medium">{achievement.name}</div>
                      <div className="text-xs text-gray-400">{achievement.unlocked ? "Unlocked" : "Locked"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Games */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Recent Games</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-2 font-medium">Opponent</th>
                    <th className="pb-2 font-medium">Result</th>
                    <th className="pb-2 font-medium">Rating</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userData?.recentGames.map((game, index) => (
                    <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3">{game.opponent}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            game.result === "win"
                              ? "bg-green-500/20 text-green-400"
                              : game.result === "loss"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {game.result.charAt(0).toUpperCase() + game.result.slice(1)}
                        </span>
                      </td>
                      <td className="py-3">{game.rating}</td>
                      <td className="py-3 text-gray-400">{game.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-center">
              <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">View All Games</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

