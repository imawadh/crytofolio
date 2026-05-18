"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

export default function Market() {
  const [info, setinfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Query, setQuery] = useState("");
  const [currencyRupee, setCurrencyRupee] = useState(false);

  const getUrl = () => {
    const currency = currencyRupee ? "inr" : "usd";
    return `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=true`;
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(getUrl())
      .then((response) => {
        setinfo(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencyRupee]);

  const filtered = info.filter((item) =>
    item.name.toLowerCase().includes(Query.toLowerCase())
  );

  const Toggle = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="pt-28 min-h-dvh pb-12">
      <div className="w-[92%] md:w-[78%] xl:w-[70%] mx-auto sticky top-[80px] z-40 mb-8">
        <div className="glass-card p-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <label htmlFor="market-search" className="sr-only">
            Search cryptocurrencies
          </label>
          <input
            id="market-search"
            type="search"
            placeholder="Search crypto…"
            className="input-field md:flex-1 py-3"
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="bg-surface-2 p-1 rounded-xl border border-border flex gap-1 shrink-0">
            <Toggle active={!currencyRupee} onClick={() => setCurrencyRupee(false)}>
              USD&nbsp;($)
            </Toggle>
            <Toggle active={currencyRupee} onClick={() => setCurrencyRupee(true)}>
              INR&nbsp;(₹)
            </Toggle>
          </div>
        </div>
      </div>

      <div className="w-[92%] md:w-[78%] xl:w-[70%] mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card p-4 h-[80px] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center text-muted">
            No coins match &ldquo;{Query}&rdquo;.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {filtered.map((value) => {
              const up = value.price_change_percentage_24h >= 0;
              return (
                <li
                  key={value.id}
                  className="glass-card-hover p-4 flex flex-row items-center justify-between gap-4 group"
                >
                  <Link
                    href={`/coin?id=${value.id}`}
                    className="flex-1 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={value.image}
                        alt={`${value.name} logo`}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {value.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-muted text-xs uppercase font-medium">
                            {value.symbol}
                          </span>
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded tabular-nums ${
                              up
                                ? "bg-success/15 text-success"
                                : "bg-danger/15 text-danger"
                            }`}
                          >
                            {up ? "▲" : "▼"} {Math.abs(value.price_change_percentage_24h ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right min-w-[110px]">
                      <div className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        Price
                      </div>
                      <div className="text-lg font-bold text-foreground tabular-nums">
                        {currencyRupee
                          ? value.current_price.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })
                          : value.current_price.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href={`/coin?id=${value.id}`}
                    className="px-6 py-2.5 rounded-lg text-primary-foreground text-sm font-bold transition-transform hover:scale-[1.03] active:scale-95"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, hsl(var(--success)), hsl(152 60% 40%))",
                    }}
                  >
                    Trade
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
