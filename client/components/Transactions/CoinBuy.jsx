"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import config from "../../config";

const BASE_URL = config.BASE_URL;

export default function CoinBuy() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const coinId = searchParams.get("coin");

  const [data, setdata] = useState();
  const [currBalance, setcurrBalance] = useState(0);
  const [currencyRupee, setCurrencyRupee] = useState(false);
  const rate = 84;

  const login =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    if (!coinId) {
      router.replace("/market");
      return;
    }
    let active = true;
    axios
      .get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&sparkline=false`
      )
      .then((res) => {
        if (!active) return;
        if (Array.isArray(res.data) && res.data.length > 0) setdata(res.data[0]);
        else router.replace("/market");
      })
      .catch((err) => {
        console.error(err);
        router.replace("/market");
      });
    return () => {
      active = false;
    };
  }, [coinId, router]);

  const getamount = async () => {
    if (!login) return;
    try {
      const res = await axios({
        method: "POST",
        url: `${BASE_URL}/wallet/getwalletAmount`,
        data: { login },
        headers: { "Content-type": "application/json" },
      });
      if (res.data && res.data[0]) setcurrBalance(res.data[0].Amount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getamount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login]);

  const [Quantity, setQuantity] = useState("");
  const [Amount, setAmount] = useState("");
  const [Quantity_for_amount, setQuantity_for_amount] = useState("");
  const [Amount_for_amount, setAmount_for_amount] = useState("");

  const getPrice = () => {
    if (!data) return 0;
    return currencyRupee ? data.current_price * rate : data.current_price;
  };
  const code = () => (currencyRupee ? "INR" : "USD");

  useEffect(() => {
    if (Quantity.length === 0 || !data) {
      setAmount("");
      return;
    }
    setAmount(
      (getPrice() * Number(Quantity)).toLocaleString("en-US", {
        maximumFractionDigits: 2,
        style: "currency",
        currency: code(),
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Quantity, data, currencyRupee]);

  const getusertransaction_byQuantity = async () => {
    if (Number(Quantity) <= 0) return alert("Please enter a valid quantity");
    await getamount();
    const priceUSD = data.current_price;
    const totalCostUSD = priceUSD * Number(Quantity);
    const object = {
      img: data.image,
      CoinId: data.id,
      CoinName: data.name,
      Quantity: Number(Quantity),
      Amount: totalCostUSD,
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
          Amount: totalCostUSD,
          login,
          CoinName: data ? data.name : "",
          Transaction: object,
        },
        headers: { "Content-type": "application/json" },
      });
      if (response.data === "NO")
        alert(`Not enough balance. Cost: $${totalCostUSD.toFixed(2)}`);
      else if (response.data === "YES") {
        alert("Transaction Successful!");
        router.push("/dashboard");
      } else if (response.data === "NO_WALLET")
        alert("Wallet not found. Contact support.");
      else alert("Transaction Failed");
    } catch (err) {
      console.error("Error Buying:", err);
      alert("Error processing transaction");
    }
  };

  useEffect(() => {
    if (Amount_for_amount.length === 0 || !data) {
      setQuantity_for_amount("");
      return;
    }
    const price = getPrice();
    if (price > 0) setQuantity_for_amount(Number(Amount_for_amount) / price);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Amount_for_amount, data, currencyRupee]);

  const getusertransaction_byAmount = async () => {
    if (Number(Amount_for_amount) <= 0)
      return alert("Please enter a valid amount");
    await getamount();
    let spentAmountUSD;
    if (currencyRupee) spentAmountUSD = Number(Amount_for_amount) / rate;
    else spentAmountUSD = Number(Amount_for_amount);
    const computedQty = spentAmountUSD / data.current_price;
    const object = {
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
          login,
          CoinName: data ? data.name : "",
          Transaction: object,
        },
        headers: { "Content-type": "application/json" },
      });
      if (response.data === "NO")
        alert(`Not enough balance. Cost: $${spentAmountUSD.toFixed(2)}`);
      else if (response.data === "YES" || response.data === "Yes") {
        alert("Purchase Successful!");
        router.push("/dashboard");
      } else if (response.data === "NO_WALLET")
        alert("Wallet not found. Contact support.");
      else alert("Transaction Failed");
    } catch (err) {
      console.error(err);
      alert("Error processing transaction");
    }
  };

  const priceLabel = getPrice().toLocaleString("en-US", {
    style: "currency",
    currency: code(),
  });
  const balLabel = (currencyRupee
    ? Number(currBalance || 0) * rate
    : Number(currBalance || 0)
  ).toLocaleString("en-US", { style: "currency", currency: code() });

  return (
    <div className="pt-28 pb-12 px-4 min-h-dvh flex justify-center">
      <div className="glass-card w-full max-w-5xl overflow-hidden p-0">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            Buy Asset
          </h1>
          <div className="bg-surface-2 p-1 rounded-lg flex gap-1 border border-border">
            {[
              ["USD ($)", false],
              ["INR (₹)", true],
            ].map(([label, val]) => (
              <button
                key={label}
                type="button"
                aria-pressed={currencyRupee === val}
                onClick={() => setCurrencyRupee(val)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
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

        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Coin panel */}
          <div className="lg:col-span-2 p-8 bg-surface-2/40 border-b lg:border-b-0 lg:border-r border-border flex flex-col items-center text-center">
            <div className="p-1 rounded-full bg-gradient-to-b from-primary/40 to-accent/40 mb-6">
              {data?.image && (
                <Image
                  src={data.image}
                  alt={`${data?.name || "coin"} logo`}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full bg-background p-1"
                />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              {data?.name}
            </h2>
            <div className="text-sm font-bold text-muted bg-surface px-3 py-1 rounded-full mb-6 border border-border">
              {data?.symbol?.toUpperCase()}
            </div>

            <div className="w-full space-y-4">
              <div className="bg-surface p-4 rounded-xl border border-border">
                <div className="text-xs text-muted uppercase tracking-wider mb-1">
                  Current Price
                </div>
                <div className="text-xl font-bold text-primary tabular-nums">
                  {priceLabel}
                </div>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-border">
                <div className="text-xs text-muted uppercase tracking-wider mb-1">
                  Wallet Balance
                </div>
                <div className="text-xl font-bold text-foreground tabular-nums">
                  {balLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Forms */}
          <div className="lg:col-span-3 p-8 space-y-8">
            <div>
              <label
                htmlFor="buy-qty"
                className="block font-semibold text-base mb-3 text-foreground"
              >
                Buy by Quantity
              </label>
              <div className="relative">
                <input
                  id="buy-qty"
                  type="number"
                  inputMode="decimal"
                  value={Quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input-field font-mono pr-16"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">
                  {data?.symbol?.toUpperCase()}
                </span>
              </div>
              <div className="mt-4 flex justify-between items-center gap-4 flex-wrap">
                <div className="text-sm text-muted">
                  You Pay:{" "}
                  <span className="text-foreground font-bold tabular-nums">
                    {Amount || "—"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={getusertransaction_byQuantity}
                  className="btn-primary"
                >
                  Buy {data?.symbol?.toUpperCase()}
                </button>
              </div>
            </div>

            <div className="h-px bg-border"></div>

            <div>
              <label
                htmlFor="buy-val"
                className="block font-semibold text-base mb-3 text-foreground"
              >
                Buy by Value ({code()})
              </label>
              <div className="relative">
                <input
                  id="buy-val"
                  type="number"
                  inputMode="decimal"
                  value={Amount_for_amount}
                  onChange={(e) => setAmount_for_amount(e.target.value)}
                  className="input-field font-mono pr-16"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">
                  {code()}
                </span>
              </div>
              <div className="mt-4 flex justify-between items-center gap-4 flex-wrap">
                <div className="text-sm text-muted">
                  Est. Qty:{" "}
                  <span className="text-foreground font-bold tabular-nums">
                    {Quantity_for_amount
                      ? Number(Quantity_for_amount).toFixed(6)
                      : "0"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={getusertransaction_byAmount}
                  className="btn-secondary"
                >
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
