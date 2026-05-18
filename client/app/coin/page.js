import { Suspense } from "react";
import CoinDetails from "../../components/coin/CoinDetails";
import Loading from "../loading";

export const metadata = {
  title: "Coin Details",
};

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CoinDetails />
    </Suspense>
  );
}
