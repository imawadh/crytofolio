import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CoinInfo({ state, open }) {
  const navigate = useNavigate();
  const data = state.value;
  // Default to USD (false means USD, previously logic was true=Rupee)
  const [currencyRupee, setcurrencyRupee] = useState(false);
  
  const [displayData, setDisplayData] = useState({});

  const login = localStorage.getItem("authToken");

  const handlebuy = () => {
    if (login) {
      navigate("/transaction", { state: { data, id: state.id } });
    } else {
      open[1](true);
    }
  };

  const handlesell = () => {
    if (login) {
      navigate("/transactionSell", { state: { data, id: state.id } });
    } else {
      open[1](true);
    }
  };

  useEffect(() => {
    // Exchange rate assumption: 1 USD ~ 84 INR
    const rate = 84; 

    if (currencyRupee) {
      setDisplayData({
        current_price: (data.current_price * rate).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        }),
        high: (data.high_24h * rate).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        }),
        low: (data.low_24h * rate).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        }),
        priceChange: (data.price_change_24h * rate).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        }),
        pricePercentageChange: data.price_change_percentage_24h,
      });
    } else {
      setDisplayData({
        current_price: data.current_price.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }),
        high: data.high_24h.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }),
        low: data.low_24h.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }),
        priceChange: data.price_change_24h.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }),
        pricePercentageChange: data.price_change_percentage_24h,
      });
    }
  }, [currencyRupee, data]);

  return (
    <div className="glass-card w-full max-w-5xl mx-auto mt-8 mb-12 p-6">
      <div className="flex flex-col md:flex-row justify-center items-center gap-10">
        
        {/* Identity */}
        <div className="flex flex-col items-center justify-center space-y-4 md:w-1/3">
            <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur-xl transition duration-500"></div>
                <img 
                    className="w-24 h-24 relative z-10 transition-transform duration-300 group-hover:scale-110" 
                    src={data.image} 
                    alt={data.name} 
                />
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {data.name}
            </h2>
            <div className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400 uppercase tracking-widest">
                {data.symbol}
            </div>
        </div>

        {/* Stats Card */}
        <div className="bg-[#1f2937]/30 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm w-full md:w-2/3 max-w-md">
            {/* Stats Grid */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center pb-2 border-b border-gray-700/50">
                    <span className="text-gray-400 font-medium text-sm">Current Price</span>
                    <span className={`text-xl font-bold ${data.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {displayData.current_price}
                    </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">24h High</span>
                    <span className="text-gray-200 font-mono">{displayData.high}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">24h Low</span>
                    <span className="text-gray-200 font-mono">{displayData.low}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
                    <span className="text-gray-400 text-sm">Price Change (24h)</span>
                    <div className="text-right">
                        <div className={`font-bold text-sm ${data.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {displayData.priceChange}
                        </div>
                    </div>
                </div>
            </div>

            {/* Currency Toggle */}
            <div className="flex bg-gray-900/50 p-1 rounded-lg mb-6">
                <button
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                    !currencyRupee ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setcurrencyRupee(false)}
                >
                USD ($)
                </button>
                <button
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                    currencyRupee ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setcurrencyRupee(true)}
                >
                INR (₹)
                </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handlebuy}
                    className="btn-primary py-2 text-base font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-transform"
                >
                    BUY
                </button>
                <button 
                    onClick={handlesell}
                    className="btn-secondary py-2 text-base font-bold border-red-500/30 text-red-100 hover:bg-red-500/10 active:scale-95 transition-transform"
                >
                    SELL
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
