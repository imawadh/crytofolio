import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import Nav from "../Nav";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useRef } from "react";
import CoinInfo from "./CoinInfo";


let tvScriptLoadingPromise;

export default function Details({ open }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  console.log(state);
  //-------------------------------------chart---------------------------------------

  const onLoadScriptRef = useRef();

  useEffect(() => {
    if (!state || !state.value) {
        navigate("/market");
        return;
    }

    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => (onLoadScriptRef.current = null);

    function createWidget() {
      if (
        document.getElementById("tradingview_17e74") &&
        "TradingView" in window
      ) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "BITSTAMP:" + `${state.value.symbol}` + "USD",
          interval: "D",
          timezone: "Asia/Kolkata",
          theme: "dark",
          style: "1",
          locale: "in",
          toolbar_bg: "#f1f3f6",
          enable_publishing: true,
          hide_legend: true,
          withdateranges: true,
          save_image: true,
          details: true,
          calendar: false,
          container_id: "tradingview_17e74",
        });
      }
    }
  }, [state, navigate]);

  //-------------------------------------chart---------------------------------------

  // If no state, don't render anything (wait for redirect)
  if (!state || !state.value) {
      return (
        <div className="h-screen flex items-center justify-center bg-[#171b26] text-white">
            <p>Loading coin details...</p>
        </div>
      );
  }

  return (
    <div className=" h-content p-5 min-h-screen w-[100%] pt-14">
      
      <div className="w-[300px] grad_bg blur-[220px]  right-[90px] h-[300px] absolute border-2 rounded-full"></div>


      <div className="tradingview-widget-container relative group">
        <div
          id="tradingview_17e74"
          className=" h-[500px] w-[90%] mx-auto pt-10"
          />
        
        {/* Floating Buy Button */}
        <button 
            onClick={() => document.getElementById('coin-info-section').scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-4 right-[10%] z-20 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-xl shadow-green-500/30 hover:scale-110 hover:shadow-green-500/50 transition-all duration-300 animate-bounce cursor-pointer flex items-center gap-2"
        >
            Buy Now ↓
        </button>
      </div>

      <div id="coin-info-section">
          <CoinInfo state={state} open={ open }/>
      </div>
          
    </div>
  );
}
