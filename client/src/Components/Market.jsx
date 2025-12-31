import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom"; 

export default function Market() {
  const location = useLocation();
  const [info, setinfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Query, setQuery] = useState("");
  
  // Currency Toggle: Default false = USD
  const [currencyRupee, setCurrencyRupee] = useState(false);
  
  // CoinGecko API URL depends on currency
  const getUrl = () => {
      const currency = currencyRupee ? "inr" : "usd";
      return `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=true`;
  };

  useEffect(() => {
    setLoading(true);
    axios.get(getUrl())
      .then((response) => {
        setinfo(response.data);
        setLoading(false);
      })
      .catch((err) => {
          console.error(err);
          setLoading(false);
      });
  }, [currencyRupee]);

  const filtered = info.filter((item) => 
      item.name.toLowerCase().includes(Query.toLowerCase())
  );

  return (
    <div className="pt-24 min-h-screen pb-10">
      
      {/* Search & Toggle Header */}
      <div className="w-[90%] md:w-[70%] mx-auto sticky top-[80px] z-40 mb-8">
        <div className="bg-[#0f111a] p-2 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl">
            
            <input
              type="text"
              placeholder="Search crypto..."
              className="w-full md:flex-1 bg-[#0a0b14] border border-blue-500/50 focus:border-blue-500 rounded-xl px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              onChange={(e) => setQuery(e.target.value)}
            />

            {/* Currency Toggle */}
            <div className="bg-[#0a0b14] p-1.5 rounded-xl border border-gray-800 flex gap-1 shrink-0">
                <button 
                    onClick={() => setCurrencyRupee(false)}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${!currencyRupee ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    USD ($)
                </button>
                <button 
                    onClick={() => setCurrencyRupee(true)}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${currencyRupee ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    INR (₹)
                </button>
            </div>

        </div>
      </div>

      {/* Grid Content */}
      <div className="w-[90%] md:w-[70%] mx-auto">
        {loading ? (
             <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
             </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {filtered.map((value) => (
                <div
                    key={value.id}
                    className="glass-card p-4 transition-all duration-300 hover:bg-[#1f2937]/60 border border-gray-800 hover:border-blue-500/50 flex flex-row items-center justify-between gap-4 relative overflow-hidden group"
                >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Clickable Coin Details Area */}
                    <Link 
                        to="/coin" 
                        state={{ value, id: location.state?.id }}
                        className="flex-1 flex items-center justify-between gap-4 z-10"
                    >
                        {/* Identity */}
                        <div className="flex items-center gap-4">
                            <img src={value.image} alt={value.name} className="w-12 h-12 rounded-full shadow-lg" />
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{value.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-xs uppercase font-medium">{value.symbol}</span>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${value.price_change_percentage_24h > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {value.price_change_percentage_24h?.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[100px]">
                             <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Price</div>
                             <div className="text-lg font-bold text-white">
                                {currencyRupee 
                                    ? value.current_price.toLocaleString("en-IN", { style: "currency", currency: "INR" }) 
                                    : value.current_price.toLocaleString("en-US", { style: "currency", currency: "USD" })
                                }
                             </div>
                        </div>
                    </Link>

                    {/* Buy Button */}
                    <Link
                        to="/coin"
                        state={{ value, id: location.state?.id }}
                        className="z-10 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105 transition-all duration-300 active:scale-95"
                    >
                        Buy
                    </Link>

                </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}
