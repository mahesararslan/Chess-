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