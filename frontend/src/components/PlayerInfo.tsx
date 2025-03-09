import { Link } from "react-router-dom"

// @ts-ignore
function PlayerInfo({ player, isActive }) {
    console.log("PLAYER INFO COMPONENT: ",player)
    // @ts-ignore
    const getInitial = (name) => {
      return name.charAt(0).toUpperCase()
    }

    if(!player) {
        return <div></div>
    }
  
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
          isActive ? "bg-amber-600/20 border border-amber-500/50" : "bg-gray-800/50"
        }`}
      >
        <Link to={player?.id ? `/account/${player.id}`: ""} target={player?.id ? "_blank" : ""}
  rel="noopener noreferrer">
        <div
          className={`w-10 h-10 rounded-full overflow-hidden ${
            isActive ? "bg-amber-500" : "bg-gray-700"
          } flex items-center justify-center text-black font-bold ring-2 ${
            isActive ? "ring-amber-400" : "ring-transparent"
          }`}
        >
          {player.image ? (
            <img src={player.image || "/placeholder.svg"} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            getInitial(player.name)
          )}
        </div>
        </Link>
        <div>
          <div className="font-medium">{player.name}</div>
          <div className="text-xs text-gray-400">{player.rating ? `Rating: ${player.rating}` : "Unrated"}</div>
        </div>
      </div>
    )
  }
  
  export default PlayerInfo
  
  