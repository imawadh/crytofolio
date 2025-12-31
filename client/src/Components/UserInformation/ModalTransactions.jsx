import React from "react";

export default function ModalTransactions({ fun }) {
  if (!fun.data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[30%] left-[30%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-[30%] right-[30%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="glass-card w-full max-w-md p-0 relative border border-gray-700/50 overflow-hidden shadow-2xl shadow-blue-500/10 scale-100 animate-fadeIn">
        
        {/* Header Gradient */}
        <div className={`h-2 w-full bg-gradient-to-r ${fun.data.type === "Buy" ? "from-green-500 to-emerald-500" : "from-red-500 to-pink-500"}`}></div>

        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          onClick={() => fun.open(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="p-8 flex flex-col items-center">
            
            <div className="relative mb-6">
                <div className={`absolute inset-0 blur-xl opacity-50 rounded-full ${fun.data.type === "Buy" ? "bg-green-500" : "bg-red-500"}`}></div>
                <img 
                    src={fun.data.img} 
                    alt={fun.data.CoinName} 
                    className="w-24 h-24 rounded-full relative z-10 border-4 border-[#0f111a] shadow-xl" 
                />
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-lg z-20 ${
                    fun.data.type === "Buy" 
                    ? "bg-[#0f111a] text-green-400 border-green-500" 
                    : "bg-[#0f111a] text-red-400 border-red-500"
                }`}>
                    {fun.data.type}
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-8">{fun.data.CoinName}</h2>

            <div className="w-full space-y-4">
                <div className="bg-[#1f2937]/40 p-5 rounded-2xl border border-gray-700/50 flex justify-between items-center group hover:bg-[#1f2937]/60 transition-colors">
                    <span className="text-gray-400 text-sm font-medium">Total Amount</span>
                    <span className="font-bold text-white text-xl tracking-tight">
                        {fun.isRupee 
                            ? (Number(fun.data.Amount) * 84).toLocaleString("en-IN", { style: "currency", currency: "INR" }) 
                            : Number(fun.data.Amount).toLocaleString("en-US", { style: "currency", currency: "USD" })
                        }
                    </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1f2937]/40 p-4 rounded-2xl border border-gray-700/50 flex flex-col justify-center items-start">
                        <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Price/Unit</span>
                        <span className="font-semibold text-gray-200">
                             {fun.isRupee 
                                ? (Number(fun.data.Prise) * 84).toLocaleString("en-IN", { style: "currency", currency: "INR" }) 
                                : Number(fun.data.Prise).toLocaleString("en-US", { style: "currency", currency: "USD" })
                            }
                        </span>
                    </div>

                    <div className="bg-[#1f2937]/40 p-4 rounded-2xl border border-gray-700/50 flex flex-col justify-center items-start">
                        <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Quantity</span>
                        <span className="font-semibold text-gray-200">{Number(fun.data.Quantity).toFixed(6)}</span>
                    </div>
                </div>

                 <div className="flex justify-center items-center pt-4">
                    <span className="text-xs font-mono text-gray-500 bg-[#1f2937]/40 px-3 py-1 rounded-full border border-gray-800">
                        {new Date(fun.data.Date).toLocaleString()}
                    </span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
