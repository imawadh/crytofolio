import { Suspense } from "react";
import ProtectedSellTransaction from "../../components/Protected/ProtectedSellTransaction";
import Loading from "../loading";

export const metadata = {
  title: "Sell Asset",
};

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedSellTransaction />
    </Suspense>
  );
}
