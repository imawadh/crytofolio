import React from "react";
import List from "./List";
import { Link } from "react-router-dom";
import bg from "../Images/bg3.png";
import { FaRocket, FaShieldAlt, FaChartLine, FaWallet } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0b14] overflow-x-hidden">
      
      {/* Premium Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-purple-600/15 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
            
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-sm font-semibold tracking-wide uppercase backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    The Future of Crypto Trading
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">Master Your</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-shadow-glow">Digital Wealth</span>
                </h1>
                
                <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Experience institutional-grade portfolio management with real-time analytics, secure execution, and AI-driven insights.
                </p>
                
                <div className="pt-6 flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
                    <Link to="/market" className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-blue-500/40 active:scale-95 overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative flex items-center gap-3">
                            Start Trading Now 
                            <FaRocket className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                    <Link to="/coin" className="px-8 py-4 rounded-xl font-bold text-white border border-gray-700 hover:bg-gray-800 transition-all hover:border-gray-500 active:scale-95 flex items-center gap-3">
                        <FaChartLine />
                        View Live Markets
                    </Link>
                </div>

                {/* Stats */}
                <div className="pt-8 flex justify-center lg:justify-start gap-12 border-t border-gray-800/50 mt-8">
                    <div>
                        <div className="text-3xl font-bold text-white">20K+</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Assets</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">$50M+</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Volume</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">0.1s</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Latency</div>
                    </div>
                </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block perspective-1000">
                {/* Floating Card Effect */}
                <div className="relative z-10 animate-float transform rotate-y-12 rotate-x-6 transition-transform duration-500 hover:rotate-0">
                    <img 
                        src={bg} 
                        alt="Platform Preview" 
                        className="w-full max-w-2xl mx-auto drop-shadow-[0_0_50px_rgba(59,130,246,0.2)]"
                    />
                    
                    {/* Floating Elements (Mockups) */}
                    <div className="absolute -top-10 -right-10 glass-card p-4 flex items-center gap-4 animate-float" style={{ animationDelay: '1s' }}>
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">₿</div>
                        <div>
                           <div className="text-xs text-gray-400">Bitcoin</div>
                           <div className="text-sm font-bold text-green-400">+5.24%</div>
                        </div>
                    </div>

                     <div className="absolute -bottom-10 -left-10 glass-card p-4 flex items-center gap-4 animate-float" style={{ animationDelay: '2.5s' }}>
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">Ξ</div>
                        <div>
                           <div className="text-xs text-gray-400">Ethereum</div>
                           <div className="text-sm font-bold text-green-400">+2.18%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose <span className="text-gradient">CryptoFolio?</span></h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">Built for both beginners and institutional traders, our platform offers the tools you need to succeed.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                  {[
                      { icon: FaShieldAlt, title: "Bank-Grade Security", desc: "Your assets are protected by military-grade encryption and cold storage protocols.", color: "text-blue-400" },
                      { icon: FaChartLine, title: "Real-Time Analytics", desc: "Make informed decisions with millisecond-latency data updates and advanced charting.", color: "text-purple-400" },
                      { icon: FaWallet, title: "Smart Portfolio", desc: "Track profit/loss across all your holdings in one unified, intuitive dashboard.", color: "text-green-400" }
                  ].map((feature, idx) => (
                      <div key={idx} className="glass-card p-8 hover:bg-[#1f2937]/80 transition-all duration-300 group hover:-translate-y-2">
                          <div className={`w-14 h-14 rounded-2xl bg-[#1a1d2d] flex items-center justify-center mb-6 text-2xl ${feature.color} group-hover:scale-110 transition-transform shadow-lg`}>
                              <feature.icon />
                          </div>
                          <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                          <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Market Trends Section */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-3xl font-bold flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                            Market Trends
                        </h3>
                        <p className="text-gray-400 mt-2">Top performers in the market right now</p>
                    </div>
                    <Link to="/market" className="text-blue-400 hover:text-white transition-colors font-semibold flex items-center gap-2">
                        View All Markets →
                    </Link>
                </div>
                <List />
             </div>
          </div>
      </section>
      
    </div>
  );
}
