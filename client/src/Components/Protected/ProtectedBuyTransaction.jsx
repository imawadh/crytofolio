import React from "react";
import { useEffect } from "react";
import CoinBuy from "../Transactions/CoinBuy";

export default function ProtectedBuyTransaction({ open }) {
  console.log(open);

  // useEffect(() => {
    // const login = localStorage.getItem("authToken");
    // console.log(login);
    // if (!login) {
    //   open[1](true);
      
    // }
  // });
  return (
    <div className="text-black bg-[#171b26] h-full">
      <CoinBuy />
    </div>
  );
}
