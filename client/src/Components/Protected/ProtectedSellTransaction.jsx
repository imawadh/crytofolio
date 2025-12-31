import React from "react";
import { useEffect } from "react";
import CoinSell from "../Transactions/CoinSell";

export default function ProtectedSellTransaction({ open }) {
  console.log(open);

  useEffect(() => {
    const login = localStorage.getItem("authToken");
    console.log(login);
    if (!login) {
      open[1](true);
      
    }
  });
  return (
    <div className="text-black bg-[#171b26] h-full">
      <CoinSell />
    </div>
  );
}
