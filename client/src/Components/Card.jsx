import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Card() {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=true";
  const [info, setinfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(url)
        .then((response) => {
            setinfo(response.data);
            console.log(response.data)
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
  }, []);

  if (loading) {
    return (
        <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {info.map((value) => (
        <Link
          key={value.id}
          to="/coin"
          state={{ value }} // Pass full coin object to details page
          className="group"
        >
          <div className="glass-card p-5 h-full transition-all duration-300 hover:-translate-y-2 hover:bg-[#1f2937]/60 border border-gray-800 hover:border-blue-500/50">
            
            <div className="flex items-center justify-between mb-4">
                <img src={value.image} alt={value.name} className="w-12 h-12 rounded-full" />
                <span className={`text-sm font-bold px-2 py-1 rounded-lg ${value.price_change_percentage_24h > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {value.price_change_percentage_24h?.toFixed(2)}%
                </span>
            </div>
            
            <h3 className="text-xl font-bold mb-1">{value.name}</h3>
            <p className="text-gray-400 text-sm uppercase mb-4">{value.symbol}</p>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-700/50 pt-4 mt-2">
                <div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Price</div>
                    <div className="text-lg font-bold text-white">${value.current_price.toLocaleString()}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Mkt Cap</div>
                    <div className="text-sm font-medium text-gray-300">${(value.market_cap / 1000000000).toFixed(2)}B</div>
                </div>
            </div>

          </div>
        </Link>
      ))}
    </div>
  );
}
