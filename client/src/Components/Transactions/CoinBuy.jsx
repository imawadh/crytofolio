import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import config from "../../config";

const BASE_URL = config.BASE_URL;

export default function CoinBuy() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [data, setdata] = useState();
  const [currBalance, setcurrBalance] = useState(0);
  
  // Default currency is USD (false means USD)
  const [currencyRupee, setCurrencyRupee] = useState(false);
  const rate = 84; // 1 USD = 84 INR (Approx)

  useEffect(() => {
    if (state && state.data) {
      setdata(state.data);
    } else {
        // Redirect if no data
        navigate('/market');
    }
  }, [state, navigate]);

  const login = localStorage.getItem("authToken");

  const getamount = async () => {
    if (!login) return;
    try {
        const res = await axios({
            method: "POST",
            url: `${BASE_URL}/wallet/getwalletAmount`,
            data: { login: login },
            headers: { "Content-type": "application/json" },
        });
        if (res.data && res.data[0]) {
            setcurrBalance(res.data[0].Amount);
        }
    } catch(err) {
        console.error(err);
    }
  };

  useEffect(() => {
    getamount();
  }, [login]);

  // Transaction Inputs
  const [Quantity, setQuantity] = useState("");
  const [Amount, setAmount] = useState(""); // Display amount string
  
  const [Quantity_for_amount, setQuantity_for_amount] = useState("");
  const [Amount_for_amount, setAmount_for_amount] = useState("");

  // Helpers for Price Display
  const getPrice = () => {
      if (!data) return 0;
      // API returns USD price directly in current_price (no division needed as per CoinInfo fix)
      // Check if data.current_price is raw USD or something else. CoinInfo uses data.current_price directly for USD.
      // The old code divided by 100 * 70 for INR.
      // Looking at CoinInfo recent fix: USD = data.current_price.
      return currencyRupee ? (data.current_price * rate) : data.current_price;
  };

  const getCurrencySymbol = () => currencyRupee ? "₹" : "$";
  const getCurrencyCode = () => currencyRupee ? "INR" : "USD";

  // Buy by Quantity Logic
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

  const getusertransaction_byQuantity = async () => {
    if (Number(Quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    
    await getamount(); // Refresh balance

    // Always calculate COST in the user's wallet currency (which is USD based on requirements)
    // Wait, if user buys in INR, we convert to USD for backend storage? 
    // Requirement: "default amount given to us also as 10000USD". So Wallet is in USD.
    // If I buy 1 BTC at $60k, cost is $60k.
    // If I switch to INR, 1 BTC is ₹50L. Cost is ₹50L.
    // BUT wallet balance is 10000 (USD).
    // So if I buy in INR, I should convert that cost back to USD to deduct from wallet? 
    // OR does the backend handle currency?
    // Backend 'Transactions' schema has 'Amount'. 'Wallet' has 'Amount'.
    // If wallet is 10000 USD, transaction Amount should be in USD effectively.
    
    const priceUSD = data.current_price;
    const totalCostUSD = priceUSD * Number(Quantity);

    // If viewing in INR, we show INR cost, but we transact in USD value for consistency if wallet is effectively USD.
    // However, for Simplicity, let's assume the system works in USD primarily now.
    
    let object = {
      img: data.image,
      CoinId: data.id,
      CoinName: data.name,
      Quantity: Number(Quantity),
      Amount: totalCostUSD, // Store cost in USD
      Date: new Date(),
      Prise: priceUSD,
      type: "Buy",
    };

    try {
      const response = await axios({
        method: "POST",
        url: `${BASE_URL}/transactions/transactions`,
        data: {
          Quantity: Number(Quantity),
          Amount: totalCostUSD, // Deduct USD amount
          login: login,
          CoinName: data ? data.name : "",
          Transaction: object,
        },
        headers: { "Content-type": "application/json" },
      });

      if (response.data === "NO") {
        alert(`Not enough balance. Cost: $${totalCostUSD.toFixed(2)}`);
      } else if (response.data === "YES") {
        alert("Transaction Successful!");
        navigate('/dashboard', { state: { id: state.id } });
      } else if (response.data === "NO_WALLET") {
          alert("Wallet not found. Contact support.");
      } else {
          alert("Transaction Failed");
      }
    } catch (err) {
      console.error("Error Buying:", err);
      alert("Error processing transaction");
    }
  };

  // Buy by Amount Logic
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

  const getusertransaction_byAmount = async () => {
      if (Number(Amount_for_amount) <= 0) {
          alert("Please enter a valid amount");
          return;
      }
    await getamount();

    // Amount_for_amount is in selected currency (USD or INR).
    // If INR, convert back to USD to get quantity/cost relative to base price.
    
    let spentAmountUSD;
    let computedQty;

    if (currencyRupee) {
        // Amount entered is INR
        // 1 USD = 84 INR => USD = INR / 84
        spentAmountUSD = Number(Amount_for_amount) / rate;
        computedQty = spentAmountUSD / data.current_price;
    } else {
        spentAmountUSD = Number(Amount_for_amount);
        computedQty = spentAmountUSD / data.current_price;
    }

    let object = {
      img: data.image,
      CoinId: data.id,
      CoinName: data.name,
      Quantity: computedQty,
      Amount: spentAmountUSD,
      Date: new Date(),
      Prise: data.current_price,
      type: "Buy",
    };

    try {
      const response = await axios({
        method: "POST",
        url: `${BASE_URL}/transactions/transactions`,
        data: {
          Quantity: computedQty,
          Amount: spentAmountUSD,
          login: login,
          CoinName: data ? data.name : "",
          Transaction: object,
        },
        headers: { "Content-type": "application/json" },
      });

      if (response.data === "NO") {
        alert(`Not enough balance. Cost: $${spentAmountUSD.toFixed(2)}`);
      } else if (response.data === "YES" || response.data === "Yes") {
        alert("Purchase Successful!");
        navigate(-1);
      }
    } catch(err) {
        console.error(err);
        alert("Error processing transaction");
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen flex justify-center bg-[#05060f] text-white">
      
      <div className="glass-card w-full max-w-5xl p-0 overflow-hidden shadow-2xl shadow-blue-500/10 border-gray-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/20 to-[#0a0b14] p-6 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Buy Asset
            </h2>
            
            {/* Currency Toggle */}
            <div className="bg-black/40 p-1 rounded-lg flex gap-1 border border-gray-700/50">
                <button 
                    onClick={() => setCurrencyRupee(false)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!currencyRupee ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    USD ($)
                </button>
                <button 
                    onClick={() => setCurrencyRupee(true)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${currencyRupee ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    INR (₹)
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5">
            
            {/* Left Panel: Coin Info */}
            <div className="lg:col-span-2 p-8 bg-[#0a0b14]/50 border-r border-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
                
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
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Wallet Balance</div>
                         <div className="text-xl font-bold text-white font-mono shadow-md shadow-blue-500/10 inline-block px-3 rounded">
                            ${currBalance?.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Buy Forms */}
            <div className="lg:col-span-3 p-8 space-y-8 bg-gradient-to-b from-[#0e0f19] to-[#05060f]">
                
                {/* Buy by Quantity */}
                <div>
                    <h4 className="flex items-center gap-2 font-semibold text-lg mb-4 text-gray-200">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        Buy by Quantity
                    </h4>
                    <div className="bg-[#131522] rounded-xl p-1 border border-gray-700/50 relative group focus-within:border-blue-500/50 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all">
                        <input 
                            type="number" 
                            value={Quantity}
                            onChange={onchangeQuantity}
                            className="bg-transparent w-full p-4 text-white outline-none font-mono placeholder-gray-600"
                            placeholder="0.00"
                        />
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                             {data?.symbol?.toUpperCase()}
                        </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                         <div className="text-sm text-gray-400">You Pay: <span className="text-white font-bold">{Amount || (getCurrencySymbol() + "0.00")}</span></div>
                         <button onClick={getusertransaction_byQuantity} className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                             Buy {data?.symbol?.toUpperCase()}
                         </button>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-800"></div>

                {/* Buy by Amount */}
                <div>
                     <h4 className="flex items-center gap-2 font-semibold text-lg mb-4 text-gray-200">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Buy by Value ({getCurrencyCode()})
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
                         <div className="text-sm text-gray-400">Est. Qty: <span className="text-white font-bold">{Quantity_for_amount ? Number(Quantity_for_amount).toFixed(6) : "0"}</span></div>
                         <button onClick={getusertransaction_byAmount} className="px-8 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95">
                             Buy Amount
                         </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}
