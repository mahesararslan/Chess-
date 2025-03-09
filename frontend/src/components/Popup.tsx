import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface PopupProps {
    title: string
    message: string
    onClose: () => void
}

function Popup({ title, message, onClose }: PopupProps) {
  const navigate = useNavigate()

  const handleNewGame = () => {
    onClose()
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-4 py-3 flex justify-between items-center">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
              Close
            </button>
            <button
              onClick={handleNewGame}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-md transition-colors"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Popup

