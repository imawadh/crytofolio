"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import config from "../../config";
import ModalTransactions from "./ModalTransactions";

export default function Dashboard() {
  const router = useRouter();
  const BASE_URL = config.BASE_URL;
  const login =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [userid, setUserid] = useState(null);
  const [allTransaction, setallTransaction] = useState([]);
  const [opentransaction, setopentransaction] = useState(false);
  const [datatransaction, setdatatransaction] = useState({});
  const [userdata, setuserdata] = useState({});

  const [rawBal, setRawBal] = useState(0);
  const [rawInv, setRawInv] = useState(0);
  const [totalNetWorth, setTotalNetWorth] = useState(0);

  const [url, seturl] = useState("");
  const [assets, setAssets] = useState([]);

  const [netProfit, setNetProfit] = useState(0);
  const [profitPercent, setProfitPercent] = useState(0);

  const [currencyRupee, setCurrencyRupee] = useState(false);
  const rate = 84;

  useEffect(() => {
    if (!login) {
      router.replace("/");
      return;
    }
    fetch(`${BASE_URL}/dashboard/dashboard`, {
      method: "POST",
      body: JSON.stringify({ Token: login }),
      headers: { "Content-type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && j.id) setUserid(j.id);
        else {
          localStorage.removeItem("authToken");
          router.replace("/");
        }
      })
      .catch((err) => console.error("Error resolving user id:", err));
  }, [login, BASE_URL, router]);

  const getDisplayValue = (val) => {
    const num = Number(val);
    if (currencyRupee)
      return (num * rate).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        style: "currency",
        currency: "INR",
      });
    return num.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: "currency",
      currency: "USD",
    });
  };

  const getallTransaction = async () => {
    try {
      const res = await axios({
        method: "POST",
        url: `${BASE_URL}/wallet/getwalletTransaction`,
        data: { login },
        headers: { "Content-type": "application/json" },
      });
      if (res.data && Array.isArray(res.data))
        setallTransaction([...res.data].reverse());
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    if (allTransaction.length > 0) {
      const map = {};
      allTransaction.forEach((t) => {
        const qty = Number(t.Quantity);
        if (!map[t.CoinId])
          map[t.CoinId] = {
            id: t.CoinId,
            name: t.CoinName,
            img: t.img,
            qty: 0,
          };
        if (t.type === "Buy") map[t.CoinId].qty += qty;
        else if (t.type === "Sell") map[t.CoinId].qty -= qty;
      });
      setAssets(Object.values(map).filter((a) => a.qty > 0.000001));
    }
  }, [allTransaction]);

  useEffect(() => {
    if (assets.length === 0) {
      setNetProfit(0);
      setProfitPercent(0);
      setTotalNetWorth(rawBal);
      return;
    }
    const ids = assets.map((a) => a.id).join(",");
    axios
      .get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`
      )
      .then((res) => {
        const priceMap = {};
        res.data.forEach((coin) => {
          priceMap[coin.id] = coin.current_price;
        });
        let total = 0;
        assets.forEach((a) => {
          total += a.qty * (priceMap[a.id] || 0);
        });
        const profitUSD = total - rawInv;
        setNetProfit(profitUSD);
        setProfitPercent(rawInv > 0 ? (profitUSD / rawInv) * 100 : 0);
        setTotalNetWorth(rawBal + total);
      })
      .catch((err) => console.error("Error fetching prices:", err));
  }, [assets, rawInv, rawBal]);

  const getamount = async () => {
    try {
      const res = await axios({
        method: "POST",
        url: `${BASE_URL}/wallet/getwalletAmount`,
        data: { login },
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
        if (json.userProfile && json.userProfile[0])
          seturl(json.userProfile[0].url);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };
    fetchuserdata();
    getallTransaction();
    getamount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  if (!userdata.Data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const profitUp = netProfit >= 0;

  return (
    <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-dvh">
      {opentransaction && (
        <ModalTransactions
          fun={{
            data: datatransaction,
            open: setopentransaction,
            isRupee: currencyRupee,
          }}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button
          type="button"
          onClick={() => router.push("/market")}
          className="btn-primary text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          View Market Trends
        </button>

        <div className="bg-surface-2 p-1 rounded-lg inline-flex gap-1 border border-border">
          {[
            ["USD ($)", false],
            ["INR (₹)", true],
          ].map(([label, val]) => (
            <button
              key={label}
              type="button"
              aria-pressed={currencyRupee === val}
              onClick={() => setCurrencyRupee(val)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                currencyRupee === val
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="space-y-8">
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div
              className="w-24 h-24 rounded-full bg-cover bg-center border-2 border-primary mb-4"
              style={{ backgroundImage: `url(${url})` }}
              role="img"
              aria-label="Profile picture"
            ></div>
            <h2 className="text-2xl font-bold text-foreground">
              {userdata.Data.first_name} {userdata.Data.last_name}
            </h2>
            <p className="text-muted mb-1">{userdata.Data.email}</p>
            <p className="text-sm text-muted mb-6">
              Mobile: {userdata.Data.mob || "—"}
            </p>
            <button
              type="button"
              onClick={() => router.push("/profileUpdate")}
              className="btn-secondary w-full text-sm"
            >
              Edit Profile
            </button>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-muted uppercase text-xs font-semibold tracking-wider mb-3">
              Available Funds
            </h3>
            <div className="text-3xl font-bold text-foreground tabular-nums">
              {getDisplayValue(rawBal)}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
              <span className="text-muted">Net Worth (Cash + Assets)</span>
              <span className="font-bold text-foreground tabular-nums">
                {getDisplayValue(totalNetWorth)}
              </span>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
              <span className="w-1.5 h-5 bg-success rounded-full"></span>
              Your Assets
            </h3>
            <div className="space-y-3">
              {assets.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">
                  No assets owned yet. Visit the market to start trading.
                </p>
              ) : (
                assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 bg-surface-2/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={asset.img}
                        alt={`${asset.name} logo`}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold text-sm text-foreground">
                        {asset.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary tabular-nums">
                      {asset.qty.toFixed(4)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <span className="w-1.5 h-6 bg-accent rounded-full"></span>
              Portfolio Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="text-muted text-sm font-medium mb-1">
                  Net Profit / Loss
                </div>
                <div
                  className={`text-4xl font-bold tabular-nums ${
                    profitUp ? "text-success" : "text-danger"
                  }`}
                >
                  {getDisplayValue(netProfit)}
                </div>
              </div>
              <div className="flex md:justify-end">
                <div
                  className={`px-4 py-2 rounded-lg font-bold text-xl flex items-center gap-2 tabular-nums ${
                    profitUp
                      ? "bg-success/15 text-success"
                      : "bg-danger/15 text-danger"
                  }`}
                >
                  {profitUp ? "▲" : "▼"} {Math.abs(profitPercent).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Recent Transactions
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {allTransaction.length === 0 ? (
                <p className="text-muted text-center py-10">
                  No transactions yet.
                </p>
              ) : (
                allTransaction.map((value, key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => {
                      setopentransaction(true);
                      setdatatransaction(value);
                    }}
                    className="w-full text-left bg-surface-2/40 border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={value.img}
                        alt={`${value.CoinName} logo`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {value.CoinName}
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${
                            value.type === "Buy"
                              ? "bg-success/15 text-success"
                              : "bg-danger/15 text-danger"
                          }`}
                        >
                          {value.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground tabular-nums">
                        {getDisplayValue(value.Amount)}
                      </div>
                      <div className="text-xs text-muted tabular-nums">
                        Qty: {Number(value.Quantity).toFixed(6)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
