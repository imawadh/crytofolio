import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import config from "../../config";
import ModalTransactions from "./ModalTransactions";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const userid = location.state?.id; 
  const BASE_URL = config.BASE_URL;
  const login = localStorage.getItem("authToken");

  const [allTransaction, setallTransaction] = useState([]);
  const [opentransaction, setopentransaction] = useState(false);
  const [datatransaction, setdatatransaction] = useState({});
  const [userdata, setuserdata] = useState({});
  
  // Balances in raw numbers (USD)
  const [rawBal, setRawBal] = useState(0);
  const [rawInv, setRawInv] = useState(0);
  const [totalNetWorth, setTotalNetWorth] = useState(0);
  
  const [url, seturl] = useState("");
  const [assets, setAssets] = useState([]); 
  
  // Profit Logic
  const [netProfit, setNetProfit] = useState(0);
  const [profitPercent, setProfitPercent] = useState(0); 

  // Currency Toggle: Default false = USD
  const [currencyRupee, setCurrencyRupee] = useState(false);
  const rate = 84; 

  // Helpers
  const getDisplayValue = (val) => {
      const num = Number(val);
      if (currencyRupee) {
          return (num * rate).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
              style: "currency",
              currency: "INR",
          });
      }
      return num.toLocaleString("en-US", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
          style: "currency",
          currency: "USD",
      });
  };

  // Fetch Transactions
  const getallTransaction = async () => {
    try {
        const res = await axios({
            method: "POST",
            url: `${BASE_URL}/wallet/getwalletTransaction`,
            data: { login: login },
            headers: { "Content-type": "application/json" },
        });
        if (res.data && Array.isArray(res.data)) {
            setallTransaction(res.data.reverse());
        }
    } catch (err) {
        console.error("Error fetching transactions:", err);
    }
  };

  // Calculate Assets from Transactions
  useEffect(() => {
      if (allTransaction.length > 0) {
          const map = {};
          allTransaction.forEach(t => {
              const qty = Number(t.Quantity);
              if (!map[t.CoinId]) {
                  map[t.CoinId] = {
                      id: t.CoinId,
                      name: t.CoinName,
                      img: t.img,
                      qty: 0
                  };
              }
              
              if (t.type === "Buy") {
                  map[t.CoinId].qty += qty;
              } else if (t.type === "Sell") {
                  map[t.CoinId].qty -= qty;
              }
          });
          
          const currentAssets = Object.values(map).filter(a => a.qty > 0.000001);
          setAssets(currentAssets);
      }
  }, [allTransaction]);

  // Fetch Current Prices & Calculate Profit
  useEffect(() => {
    if (assets.length === 0) {
        setNetProfit(0);
        setProfitPercent(0);
        return;
    }

    const ids = assets.map(a => a.id).join(",");
    // ALWAYS fetch in USD to ensure consistency with rawInv (which is in USD)
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`;

    axios.get(url)
        .then(res => {
            const priceMap = {};
            res.data.forEach(coin => {
                priceMap[coin.id] = coin.current_price;
            });

            let currentTotalAssetValueUSD = 0;
            assets.forEach(asset => {
                const price = priceMap[asset.id] || 0;
                currentTotalAssetValueUSD += asset.qty * price;
            });

            // Calculate Profit in USD
            const profitUSD = currentTotalAssetValueUSD - rawInv; // rawInv is Invested Amount in USD
            
            // Set Net Profit (Store in USD, convert in render)
            setNetProfit(profitUSD);
            
            // Set Profit Percent (Math is same regardless of currency)
            if (rawInv > 0) {
                setProfitPercent((profitUSD / rawInv) * 100);
            } else {
                setProfitPercent(0);
            }

            // Update Total Portfolio Value for "Fund" display (Cash + Assets)
            // We can store this in a new state or just update how we use rawBal?
            // Actually, "Total Balance" usually implies Net Worth. 
            // Let's create a state for it or just calculate it. 
            // Since this effect runs on asset change, let's update a state variable.
            // But verify: rawBal is Wallet Cash. 
            // So Total Net Worth = rawBal + currentTotalAssetValueUSD
            
            // Ideally we should have a separate state for Total Net Worth, but to minimize changes
            // let's stick to the existing patterns. 
            // Wait, existing code uses `getDisplayValue(rawBal)` for Total Balance.
            // I should override rawBal or create a new state? 
            // A new state is cleaner.
            setTotalNetWorth(rawBal + currentTotalAssetValueUSD);

        })
        .catch(err => console.error("Error fetching prices:", err));
  }, [assets, rawInv, rawBal]);

  // Fetch Wallet Balance
  const getamount = async () => {
    try {
        const res = await axios({
            method: "POST",
            url: `${BASE_URL}/wallet/getwalletAmount`,
            data: { login: login },
            headers: { "Content-type": "application/json" },
        });
        if (res.data && res.data[0]) {
            setRawBal(res.data[0].Amount);
            setRawInv(res.data[0].Invested);
        }
    } catch (err) {
        console.error("Error fetching wallet amount:", err);
    }
  };

  // Fetch User Data
  useEffect(() => {
    if (!userid) return;
    const fetchuserdata = async () => {
      try {
        const response = await fetch(`${BASE_URL}/dashboard/userdetails`, {
            method: "POST",
            body: JSON.stringify({ UserId: userid }),
            headers: { "Content-type": "application/json" },
        });
        const json = await response.json();
        setuserdata(json);
        if (json.userProfile && json.userProfile[0]) {
            seturl(json.userProfile[0].url);
        }
      } catch (err) {
          console.error("Error fetching user details:", err);
      }
    };
    fetchuserdata();
    getallTransaction();
    getamount();
  }, [userid]);

  const handleupdate = () => {
    navigate("/profileUpdate", { state: { id: userid } });
  };

  if (!userdata.Data) {
      return (
          <div className="flex h-screen items-center justify-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
      );
  }

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      
      {opentransaction && (
        <ModalTransactions
          fun={{ data: datatransaction, open: setopentransaction, isRupee: currencyRupee }}
        />
      )}
      
      {/* Header Actions: Market Trend & Currency Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        
        {/* Market Trend Button */}
        <button 
            onClick={() => navigate('/market', { state: { id: userid } })}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            View Market Trends
        </button>

        {/* Currency Toggle */}
        <div className="bg-gray-800 p-1 rounded-lg inline-flex gap-2">
            <button 
                onClick={() => setCurrencyRupee(false)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!currencyRupee ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                USD ($)
            </button>
            <button 
                onClick={() => setCurrencyRupee(true)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currencyRupee ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                INR (₹)
            </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile & Wallet & Assets */}
        <div className="space-y-8">
            
            {/* Profile Card */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
                <div 
                    className="w-24 h-24 rounded-full bg-cover bg-center border-2 border-blue-500 shadow-lg shadow-blue-500/30 mb-4"
                    style={{ backgroundImage: `url(${url})` }}
                ></div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {userdata.Data.first_name} {userdata.Data.last_name}
                </h2>
                <p className="text-gray-400 mb-2">{userdata.Data.email}</p>
                <div className="text-sm text-gray-500 mb-6">Mobile: {userdata.Data.mob}</div>
                
                <button onClick={handleupdate} className="btn-secondary w-full text-sm">
                    Edit Profile
                </button>
            </div>

            {/* Wallet Card */}
            <div className="glass-card p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-24 h-24 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                </div>
                
                <h3 className="text-gray-400 uppercase text-xs font-semibold tracking-wider mb-4">Total Balance (Fund)</h3>
                <div className="text-3xl font-bold text-white mb-2">{getDisplayValue(rawBal)}</div>
                
                <div className="mt-4 pt-4 border-gray-700"></div>
            </div>

             {/* My Assets */}
             <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-green-500 rounded-full"></span>
                    Your Assets
                </h3>
                <div className="space-y-3">
                    {assets.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-4">No assets owned yet</div>
                    ) : (
                        assets.map((asset, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition">
                                <div className="flex items-center gap-3">
                                    <img src={asset.img} alt={asset.name} className="w-8 h-8 rounded-full" />
                                    <span className="font-semibold text-sm">{asset.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-blue-300">{asset.qty.toFixed(4)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

        {/* Right Column: Transactions & Profit */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Profit Section */}
            <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 8.586 15.293 4.293A1 1 0 0115.586 4H12z" clipRule="evenodd" />
                    </svg>
                </div>
                
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-yellow-500 rounded-full"></span>
                    Portfolio Performance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="text-gray-400 text-sm font-medium mb-1">Net Profit / Loss</div>
                        <div className={`text-4xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {getDisplayValue(netProfit)}
                        </div>
                    </div>
                    
                    <div className="flex items-end">
                        <div className={`px-4 py-2 rounded-lg font-bold text-xl flex items-center gap-2 ${netProfit >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {netProfit >= 0 ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                            )}
                            {profitPercent.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                    Recent Transactions
                </h3>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {allTransaction.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">No transactions found</div>
                    ) : (
                        allTransaction.map((value, key) => (
                            <div
                                key={key}
                                onClick={() => {
                                    setopentransaction(true);
                                    setdatatransaction(value);
                                }}
                                className="bg-[#0a0b14]/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:bg-[#1a1d2d] hover:border-gray-700 transition cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <img src={value.img} alt={value.CoinName} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <div className="font-semibold">{value.CoinName}</div>
                                        <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${
                                            value.type === "Buy" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                        }`}>
                                            {value.type}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="font-bold">{getDisplayValue(value.Amount)}</div>
                                    <div className="text-xs text-gray-500">Qty: {Number(value.Quantity).toFixed(6)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
