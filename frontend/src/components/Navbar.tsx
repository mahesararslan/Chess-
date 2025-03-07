// @ts-nocheck

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"


function Navbar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [isScrolled, setIsScrolled] = useState(false)

    const getUser = async (token: string) => {
        
        try {
            const response = await axios.get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("User:", response.data);
            return response.data
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };


    useEffect(() => { 
        
        const token = localStorage.getItem("token");
        if (token) {
            getUser(token)
                .then((user) => {
                    if (user) {
                        setUser(user); 
                    }
                });
        }
    }, []); 

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(""); 
    };

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Get first letter for avatar fallback
  const getInitial = (name) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-gray-900/95 backdrop-blur-sm shadow-lg" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to={"/"}><img src="/chess-logo.png" width={150} alt="Logo" /></Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </a>
            <a href="/select-game" className="text-gray-300 hover:text-white transition-colors">
              Play
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Community
            </a>
            {user && (
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded transition-colors"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            )}

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500 flex items-center justify-center text-white font-bold">
                  {user.image ? (
                    <Link to="/profile">
                    <img
                      src={user.image || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                    </Link>
                  ) : (
                    getInitial(user.name)
                  )}
                </div>
              </div>
            ) : (
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded transition-colors"
                onClick={() => window.location.href = "/signin"}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <a href="#" className="text-white py-2 block">
              Home
            </a>
            <a href="#" className="text-white py-2 block">
              Play
            </a>
            <a href="#" className="text-white py-2 block">
              Community
            </a>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center py-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500 flex items-center justify-center text-white font-bold mr-3">
                  {user.image ? (
                    <img
                      src={user.image || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitial(user.name)
                  )}
                </div>
                <span className="text-white">{user.name}</span>
              </div>
            ) : (
              <button className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded transition-colors">
                Sign In
              </button>
            )}
            {user && (
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded transition-colors"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

