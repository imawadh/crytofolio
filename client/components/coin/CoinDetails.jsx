"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Script from "next/script";
import axios from "axios";
import CoinInfo from "./CoinInfo";

export default function CoinDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const id = searchParams.get("id");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const scriptReady = useRef(false);

  useEffect(() => {
    if (!id) {
      router.replace("/market");
      return;
    }
    let active = true;
    axios
      .get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&sparkline=false`
      )
      .then((res) => {
        if (!active) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          setData(res.data[0]);
        } else {
          setMissing(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setMissing(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id, router]);

  const createWidget = () => {
    if (typeof window === "undefined" || !window.TradingView || !data) return;
    const container = document.getElementById("tradingview_17e74");
    if (!container) return;
    container.innerHTML = "";
    // eslint-disable-next-line no-new
    new window.TradingView.widget({
      autosize: true,
      symbol: "BITSTAMP:" + `${data.symbol}`.toUpperCase() + "USD",
      interval: "D",
      timezone: "Asia/Kolkata",
      theme: resolvedTheme === "light" ? "light" : "dark",
      style: "1",
      locale: "in",
      enable_publishing: false,
      hide_legend: true,
      withdateranges: true,
      save_image: true,
      details: true,
      calendar: false,
      container_id: "tradingview_17e74",
    });
  };

  // Re-create widget when data or theme changes.
  useEffect(() => {
    if (data && scriptReady.current) createWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, resolvedTheme]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (missing || !data) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background text-foreground">
        <div className="glass-card p-10 text-center">
          <p className="text-lg font-semibold mb-4">Coin not found.</p>
          <button
            onClick={() => router.push("/market")}
            className="btn-primary"
          >
            Back to Market
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-4 sm:px-6 pt-28 pb-10 max-w-7xl mx-auto">
      <Script
        src="https://s3.tradingview.com/tv.js"
        strategy="afterInteractive"
        onReady={() => {
          scriptReady.current = true;
          createWidget();
        }}
      />

      <div className="glass-card p-4 sm:p-6 relative overflow-hidden">
        <div
          id="tradingview_17e74"
          className="h-[480px] w-full rounded-xl overflow-hidden"
        />
        <button
          onClick={() =>
            document
              .getElementById("coin-info-section")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="absolute bottom-6 right-6 z-20 btn-primary px-6 py-3 rounded-full shadow-xl"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--success)), hsl(152 60% 40%))",
          }}
        >
          Trade Now ↓
        </button>
      </div>

      <div id="coin-info-section">
        <CoinInfo data={data} />
      </div>
    </div>
  );
}
