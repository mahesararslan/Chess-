import { Color } from "chess.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Notification = ({visible, winner}: {
    visible: boolean;
    winner: Color | null;
}) => {
    const [isVisible, setIsVisible] = useState(visible);
  
    const closeNotification = () => {
      setIsVisible(false);
      window.location.reload();
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-80">
            <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={closeNotification}
            >
                &times;
            </button>
            <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Game Over</h2>
                    <p className="text-xl">
                        {winner === 'w' ? "White" : "Black"} wins by checkmate!
                    </p>
            </div>
        </div>
      </div>
    );
  };


  export const ResignNotification = ({visible, message}: {
    visible: boolean;
    message: string;
}) => {
    const [isVisible, setIsVisible] = useState(visible);
  
    const closeNotification = () => {
      setIsVisible(false);
      window.location.reload();
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-80">
            <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={closeNotification}
            >
                &times;
            </button>
            <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Game Over</h2>
                    <p className="text-xl">
                        {message}
                    </p>
            </div>
        </div>
      </div>
    );
  };

  export const DisconnectedNotification = ({visible, message}: {
    visible: boolean;
    message: string;
}) => {
    const [isVisible, setIsVisible] = useState(visible);
  
    const closeNotification = () => {
      setIsVisible(false);
      window.location.reload();
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-80">
            <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={closeNotification}
            >
                &times;
            </button>
            <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Game Over</h2>
                    <p className="text-xl">
                        {message}
                    </p>
            </div>
        </div>
      </div>
    );
  };

  export const TimeoutNotification = ({visible, message}: {
    visible: boolean;
    message: string;
}) => {
    const [isVisible, setIsVisible] = useState(visible);
  
    const closeNotification = () => {
      setIsVisible(false);
      window.location.reload();
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-80">
            <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={closeNotification}
            >
                &times;
            </button>
            <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Game Over</h2>
                    <p className="text-xl">
                        {message}
                    </p>
            </div>
        </div>
      </div>
    );
  };

  
  export const ErrorNotification = ({visible, message}: {
    visible: boolean;
    message: string;
}) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(visible);
  
  useEffect(() => {
    setTimeout(() => {
      setIsVisible(false)
      navigate("/")
    },4000)
  },[])

  
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-80">
            <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Game Over</h2>
                    <p className="text-xl">
                        {message}
                    </p>
                    {/* close the tab after 10s */}
                    <button className="font-bold p-5 mt-8 bg-stone-800 w-full hover:bg-stone-600 rounded-lg text-white" onClick={() => {
                        navigate("/");
                    }}>
                        Close
                    </button>
            </div>
        </div>
      </div>
    );
  };


import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"

// Type can be: success, warning, info, error (default is info)

interface NotificationBarProps {
  message: string
  type?: "success" | "warning" | "info" | "error"
  duration?: number
  onClose?: () => void
}

function NotificationBar({ message, type = "info", duration = 5000, onClose }: NotificationBarProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) setTimeout(onClose, 300) // Allow animation to complete
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) setTimeout(onClose, 300) // Allow animation to complete
  }

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />
      case "warning":
        return <AlertTriangle className="h-5 w-5" />
      case "error":
        return <AlertCircle className="h-5 w-5" />
      case "info":
      default:
        return <Info className="h-5 w-5" />
    }
  }

  // Background color based on type
  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-amber-500"
      case "error":
        return "bg-red-500"
      case "info":
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className={`${getBgColor()} text-white rounded-lg shadow-lg flex items-center p-4`}>
        <div className="mr-3">{getIcon()}</div>
        <div className="flex-1">{message}</div>
        <button onClick={handleClose} className="ml-3 text-white/80 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default NotificationBar

