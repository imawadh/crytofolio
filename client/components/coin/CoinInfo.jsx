"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useModal } from "../ModalProvider";

export default function CoinInfo({ data }) {
  const router = useRouter();
  const { open } = useModal();

  const [currencyRupee, setcurrencyRupee] = useState(false);
  const [displayData, setDisplayData] = useState({});

  const requireAuth = (path) => {
    const login =
      typeof window !== "undefined" && localStorage.getItem("authToken");
    if (login) router.push(path);
    else open[1](true);
  };

  useEffect(() => {
    const rate = 84;
    const fmt = (n, code, locale) =>
      n.toLocaleString(locale, { style: "currency", currency: code });

    if (currencyRupee) {
      setDisplayData({
        current_price: fmt(data.current_price * rate, "INR", "en-IN"),
        high: fmt(data.high_24h * rate, "INR", "en-IN"),
        low: fmt(data.low_24h * rate, "INR", "en-IN"),
        priceChange: fmt(data.price_change_24h * rate, "INR", "en-IN"),
      });
    } else {
      setDisplayData({
        current_price: fmt(data.current_price, "USD", "en-US"),
        high: fmt(data.high_24h, "USD", "en-US"),
        low: fmt(data.low_24h, "USD", "en-US"),
        priceChange: fmt(data.price_change_24h, "USD", "en-US"),
      });
    }
  }, [currencyRupee, data]);

  const up = data.price_change_24h >= 0;

  return (
    <div className="glass-card w-full max-w-5xl mx-auto mt-8 mb-12 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-center items-center gap-10">
        {/* Identity */}
        <div className="flex flex-col items-center text-center space-y-4 md:w-1/3">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full opacity-25 blur-xl bg-gradient-to-r from-primary to-accent"></div>
            <Image
              className="w-24 h-24 relative z-10"
              src={data.image}
              alt={`${data.name} logo`}
              width={96}
              height={96}
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{data.name}</h1>
          <div className="px-3 py-1 rounded-full bg-surface-2 border border-border text-xs text-muted uppercase tracking-widest">
            {data.symbol}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-surface-2/60 rounded-2xl p-6 border border-border w-full md:w-2/3 max-w-md">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted font-medium text-sm">Current Price</span>
              <span
                className={`text-xl font-bold tabular-nums ${
                  up ? "text-success" : "text-danger"
                }`}
              >
                {displayData.current_price}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">24h High</span>
              <span className="text-foreground tabular-nums">{displayData.high}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">24h Low</span>
              <span className="text-foreground tabular-nums">{displayData.low}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-muted text-sm">Price Change (24h)</span>
              <span
                className={`font-bold text-sm tabular-nums ${
                  up ? "text-success" : "text-danger"
                }`}
              >
                {up ? "▲ " : "▼ "}
                {displayData.priceChange}
              </span>
            </div>
          </div>

          {/* Currency toggle */}
          <div className="flex bg-surface p-1 rounded-lg mb-6 border border-border">
            <button
              type="button"
              aria-pressed={!currencyRupee}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${
                !currencyRupee
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              onClick={() => setcurrencyRupee(false)}
            >
              USD ($)
            </button>
            <button
              type="button"
              aria-pressed={currencyRupee}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${
                currencyRupee
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              onClick={() => setcurrencyRupee(true)}
            >
              INR (₹)
            </button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => requireAuth(`/transaction?coin=${data.id}`)}
              className="btn-primary py-2.5 text-base"
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => requireAuth(`/transactionSell?coin=${data.id}`)}
              className="inline-flex items-center justify-center font-semibold py-2.5 px-6 rounded-lg text-base border border-danger/40 text-danger transition-colors hover:bg-danger/10 hover:border-danger active:scale-[0.98]"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
