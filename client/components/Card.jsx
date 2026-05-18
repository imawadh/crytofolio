"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Card() {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=true";
  const [info, setinfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(url)
      .then((response) => {
        setinfo(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-5 h-[180px] animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-surface-2" />
              <div className="w-16 h-6 rounded-lg bg-surface-2" />
            </div>
            <div className="h-5 w-2/3 bg-surface-2 rounded mb-2" />
            <div className="h-4 w-1/3 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {info.map((value) => {
        const up = value.price_change_percentage_24h >= 0;
        return (
          <Link key={value.id} href={`/coin?id=${value.id}`} className="group">
            <div className="glass-card-hover p-5 h-full hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <Image
                  src={value.image}
                  alt={`${value.name} logo`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
                <span
                  className={`text-sm font-bold px-2 py-1 rounded-lg tabular-nums ${
                    up
                      ? "bg-success/15 text-success"
                      : "bg-danger/15 text-danger"
                  }`}
                >
                  {up ? "▲" : "▼"} {Math.abs(value.price_change_percentage_24h ?? 0).toFixed(2)}%
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1 text-foreground">
                {value.name}
              </h3>
              <p className="text-muted text-sm uppercase mb-4">{value.symbol}</p>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">
                    Price
                  </div>
                  <div className="text-lg font-bold text-foreground tabular-nums">
                    ${value.current_price.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">
                    Mkt Cap
                  </div>
                  <div className="text-sm font-medium text-foreground tabular-nums">
                    ${(value.market_cap / 1e9).toFixed(2)}B
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
