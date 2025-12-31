import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import config from "../../config";

const BASE_URL = config.BASE_URL;

export default function CoinSell() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [data, setdata] = useState();
  const [availableQuantity, setAvailableQuantity] = useState(0);

  // Default currency is USD
  const [currencyRupee, setCurrencyRupee] = useState(false);
  const rate = 84; 

  useEffect(() => {
    if (state && state.data) {
      setdata(state.data);
    }
  }, [state]);

  const login = localStorage.getItem("authToken");

  // Calculate Available Holdings
  useEffect(() => {
    if (!login || !state?.data) return;

    const fetchHoldings = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/wallet/getwalletTransaction`, { login });
            
            let transactions = [];
            // Backend Controller sends data[0].Transaction which is an array of transaction objects
            if (Array.isArray(res.data)) {
                // Check if it's nested (e.g. [{ Transaction: [...] }])
                if (res.data.length > 0 && res.data[0].Transaction) {
                    transactions = res.data[0].Transaction;
                } else {
                    // Otherwise it's the direct array
                    transactions = res.data;
                }
            } else if (res.data && res.data.Transaction) {
                // Format: { Transaction: [...] }
                transactions = res.data.Transaction;
            }

            let qty = 0;
            transactions.forEach(t => {
                if (t.CoinId === state.data.id) {
                    if (t.type === "Buy") qty += Number(t.Quantity);
                    else if (t.type === "Sell") qty -= Number(t.Quantity);
                }
            });
            setAvailableQuantity(qty);

        } catch (err) {
            console.error(err);
        }
    };
    fetchHoldings();
  }, [login, state]);


  // Inputs
  const [Quantity, setQuantity] = useState("");
  const [Amount_for_amount, setAmount_for_amount] = useState("");
  const [Amount, setAmount] = useState(""); // Display amount string
  const [Quantity_for_amount, setQuantity_for_amount] = useState(""); 

  const getPrice = () => {
    if (!data) return 0;
    return currencyRupee ? (data.current_price * rate) : data.current_price;
  };
  
  const getCurrencySymbol = () => currencyRupee ? "₹" : "$";
  const getCurrencyCode = () => currencyRupee ? "INR" : "USD";

  // Sell by Quantity Logic
  useEffect(() => {
    if (Quantity.length === 0 || !data) {
      setAmount("");
      return;
    }
    const price = getPrice();
    setAmount((price * Number(Quantity)).toLocaleString("en-US", {
        maximumFractionDigits: 2,
        style: "currency",
        currency: getCurrencyCode(),
    }));
  }, [Quantity, data, currencyRupee]);

  const onchangeQuantity = (e) => setQuantity(e.target.value);

  const handleSellByQuantity = async () => {
    if (Number(Quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    if (Number(Quantity) > availableQuantity) {
        alert(`Insufficient holdings. You only have ${availableQuantity} ${data?.symbol?.toUpperCase()}`);
        return;
    }

    // Always transact in USD
    const priceUSD = data.current_price;
    const totalCostUSD = priceUSD * Number(Quantity);
    
    let object = {
      img: data.image,
      CoinId: data.id,
      CoinName: data.name,
      Quantity: Number(Quantity),
      Amount: totalCostUSD,
      Date: new Date(),
      Prise: priceUSD,
      type: "Sell",
    };

    try {
      const response = await axios({
        method: "POST",
        url: `${BASE_URL}/transactions/selltransactions`,
        data: {
          Quantity: Number(Quantity),
          Amount: totalCostUSD,
          login: login,
          CoinName: data ? data.name : "",
          Transaction: object,
        },
        headers: { "Content-type": "application/json" },
      });

      if (response.data === "NO") {
        alert("Insufficient Holdings (Server Checked)");
      } else if (response.data === "YES") {
        alert("Sell Successful!");
        navigate('/dashboard', { state: { id: state.id } });
      }
    } catch (err) {
      console.error(err);
      alert("Error processing transaction");
    }
  };

  // Sell by Amount Logic
  useEffect(() => {
    if (Amount_for_amount.length === 0 || !data) {
        setQuantity_for_amount("");
        return;
    }
    const price = getPrice();
    if (price > 0) {
        setQuantity_for_amount(Number(Amount_for_amount) / price);
    }
  }, [Amount_for_amount, data, currencyRupee]);

  const onchangeAmount = (e) => setAmount_for_amount(e.target.value);

  const handleSellByAmount = async () => {
      if (Number(Amount_for_amount) <= 0) {
          alert("Please enter a valid amount");
          return;
      }
    
    // Convert entered amount to USD if needed
    let receivedAmountUSD;
    let computedQty;

    if (currencyRupee) {
         receivedAmountUSD = Number(Amount_for_amount) / rate;
         computedQty = receivedAmountUSD / data.current_price;
    } else {
         receivedAmountUSD = Number(Amount_for_amount);
         computedQty = receivedAmountUSD / data.current_price;
    }

    if (computedQty > availableQuantity) {
        alert(`Insufficient holdings. You need ${computedQty.toFixed(4)} but have ${availableQuantity}`);
        return;
    }

    let object = {
      img: data.image,
      CoinId: data.id,
      CoinName: data.name,
      Quantity: computedQty,
      Amount: receivedAmountUSD,
      Date: new Date(),
      Prise: data.current_price,
      type: "Sell",
    };

    try {
      const response = await axios({
        method: "POST",
        url: `${BASE_URL}/transactions/selltransactions`,
        data: {
          Quantity: computedQty,
          Amount: receivedAmountUSD,
          login: login,
          CoinName: data ? data.name : "",
          Transaction: object,
        },
        headers: { "Content-type": "application/json" },
      });

      if (response.data === "NO") {
        alert("Insufficient Holdings");
      } else if (response.data === "YES") {
        alert("Sell Successful!");
        navigate(-1);
      }
    } catch(err) {
        console.error(err);
        alert("Error processing transaction");
    }
  };

  const handleMax = () => {
      setQuantity(availableQuantity);
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen flex justify-center bg-[#05060f] text-white">
      
      <div className="glass-card w-full max-w-5xl p-0 overflow-hidden shadow-2xl shadow-red-500/10 border-gray-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/20 to-[#0a0b14] p-6 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                Sell Asset
            </h2>
            
            {/* Currency Toggle */}
            <div className="bg-black/40 p-1 rounded-lg flex gap-1 border border-gray-700/50">
                <button 
                    onClick={() => setCurrencyRupee(false)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!currencyRupee ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    USD ($)
                </button>
                <button 
                    onClick={() => setCurrencyRupee(true)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${currencyRupee ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    INR (₹)
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5">
            
            {/* Left Panel: Coin Info */}
            <div className="lg:col-span-2 p-8 bg-[#0a0b14]/50 border-r border-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-red-500/5 blur-3xl rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 p-1 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 mb-6">
                    <img src={data?.image} alt={data?.name} className="w-24 h-24 rounded-full bg-[#0a0b14] p-1" />
                </div>
                
                <h3 className="text-3xl font-bold mb-2 text-white">{data?.name}</h3>
                <div className="text-sm font-bold text-gray-500 bg-[#1a1d2d] px-3 py-1 rounded-full mb-6 border border-gray-700">
                    {data?.symbol?.toUpperCase()}
                </div>

                <div className="w-full space-y-4">
                    <div className="bg-[#131522] p-4 rounded-xl border border-gray-800">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Price</div>
                        <div className="text-xl font-bold text-blue-400">
                             {getPrice().toLocaleString("en-US", { style: "currency", currency: getCurrencyCode() })}
                        </div>
                    </div>

                    <div className="bg-[#131522] p-4 rounded-xl border border-gray-800">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Your Holdings</div>
                         <div className="text-xl font-bold text-green-400">
                            {availableQuantity} <span className="text-xs text-gray-500">{data?.symbol?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Sell Forms */}
            <div className="lg:col-span-3 p-8 space-y-8 bg-gradient-to-b from-[#0e0f19] to-[#05060f]">
                
                {/* Sell by Quantity */}
                <div>
                    <h4 className="flex items-center gap-2 font-semibold text-lg mb-4 text-gray-200">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                        Sell by Quantity
                    </h4>
                    <div className="bg-[#131522] rounded-xl p-1 border border-gray-700/50 relative group focus-within:border-red-500/50 focus-within:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all">
                        <input 
                            type="number" 
                            value={Quantity}
                            onChange={onchangeQuantity}
                            className="bg-transparent w-full p-4 text-white outline-none font-mono placeholder-gray-600"
                            placeholder="0.00"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                             <button 
                                onClick={handleMax}
                                className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-md shadow-lg shadow-red-500/20 transition-all hover:scale-105"
                             >
                                SELL 100%
                             </button>
                             <span className="text-gray-500 font-bold px-2">{data?.symbol?.toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                         <div className="text-sm text-gray-400">You Receive: <span className="text-white font-bold">{Amount || (getCurrencySymbol() + "0.00")}</span></div>
                         <button onClick={handleSellByQuantity} className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-lg shadow-lg shadow-red-600/20 transition-all hover:scale-105 active:scale-95">
                             Sell {data?.symbol?.toUpperCase()}
                         </button>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-800"></div>

                {/* Sell by Amount */}
                <div>
                     <h4 className="flex items-center gap-2 font-semibold text-lg mb-4 text-gray-200">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Sell by Value ({getCurrencyCode()})
                    </h4>
                    <div className="bg-[#131522] rounded-xl p-1 border border-gray-700/50 relative group focus-within:border-purple-500/50 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all">
                        <input 
                            type="number" 
                            value={Amount_for_amount}
                            onChange={onchangeAmount}
                            className="bg-transparent w-full p-4 text-white outline-none font-mono placeholder-gray-600"
                            placeholder={getCurrencySymbol() + "0.00"}
                        />
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                             {getCurrencyCode()}
                        </div>
                    </div>
                     <div className="mt-4 flex justify-between items-center">
                         <div className="text-sm text-gray-400">Sell Qty: <span className="text-white font-bold">{Quantity_for_amount ? Number(Quantity_for_amount).toFixed(6) : "0"}</span></div>
                         <button onClick={handleSellByAmount} className="px-8 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95">
                             Sell Amount
                         </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}
