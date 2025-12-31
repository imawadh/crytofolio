import { Link, useNavigate } from "react-router-dom";

import config from "../config";

export default function Nav({ open }) {
  const navigate = useNavigate();
  const BASE_URL = config.BASE_URL;

  const handleDashboard = async () => {
    try {
        const response = await fetch(`${BASE_URL}/dashboard/dashboard`, {
            method: "POST",
            body: JSON.stringify({ Token: localStorage.authToken }),
            mode: "cors",
            headers: {
                "Content-type": "application/json",
            },
        });
        const json = await response.json();
        navigate("/dashboard", { state: { id: json.id } });
    } catch (err) {
        console.error("Dashboard navigation error:", err);
    }
  };

  const handlelogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="fixed w-full z-50 top-4 px-4 sm:px-6 lg:px-8">
      <nav className="max-w-7xl mx-auto glass-card flex justify-between items-center h-[70px] px-6">
          
        {/* Logo */}
        <div className="flex-shrink-0">
            <Link to="/" className="text-2xl md:text-3xl font-extrabold tracking-wide">
                <span className="text-white">Crypto</span>
                <span className="text-gradient">Folio</span>
            </Link>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6">
            {!localStorage.getItem("authToken") ? (
              <>
                <button
                    onClick={() => open[0](true)}
                    className="nav-link text-lg hidden sm:block"
                >
                    Sign In
                </button>
                <button
                    onClick={() => open[1](true)}
                    className="btn-primary text-sm md:text-base"
                >
                    Get Started
                </button>
              </>
            ) : (
              <>
                <button 
                    onClick={handleDashboard}
                    className="nav-link text-lg"
                >
                    Dashboard
                </button>
                <button 
                    onClick={handlelogout}
                    className="btn-secondary text-sm md:text-base border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-100"
                >
                    Sign Out
                </button>
              </>
            )}
        </div>
      </nav>
    </div>
  );
}
