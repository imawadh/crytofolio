import { Suspense } from "react";
import ProtectedBuyTransaction from "../../components/Protected/ProtectedBuyTransaction";
import Loading from "../loading";

export const metadata = {
  title: "Buy Asset",
};

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedBuyTransaction />
    </Suspense>
  );
}
