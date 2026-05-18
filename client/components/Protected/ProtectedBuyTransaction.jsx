"use client";

import { useEffect } from "react";
import CoinBuy from "../Transactions/CoinBuy";
import { useModal } from "../ModalProvider";

export default function ProtectedBuyTransaction() {
  const { open } = useModal();

  useEffect(() => {
    const login = localStorage.getItem("authToken");
    if (!login) {
      open[1](true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-dvh text-foreground">
      <CoinBuy />
    </div>
  );
}
