import Image from "next/image";
import { FiX } from "react-icons/fi";

export default function ModalTransactions({ fun }) {
  if (!fun.data) return null;
  const isBuy = fun.data.type === "Buy";

  const money = (v) =>
    fun.isRupee
      ? (Number(v) * 84).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })
      : Number(v).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) fun.open(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${fun.data.type} transaction details`}
        className="glass-card w-full max-w-md p-0 relative overflow-hidden animate-scale-in"
      >
        <div
          className={`h-1.5 w-full ${
            isBuy ? "bg-success" : "bg-danger"
          }`}
        ></div>

        <button
          type="button"
          aria-label="Close details"
          className="absolute top-4 right-4 grid place-items-center w-9 h-9 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          onClick={() => fun.open(false)}
        >
          <FiX className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="p-8 flex flex-col items-center">
          <div className="relative mb-6">
            <Image
              src={fun.data.img}
              alt={`${fun.data.CoinName} logo`}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full border-4 border-surface"
            />
            <div
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isBuy
                  ? "bg-surface text-success border-success"
                  : "bg-surface text-danger border-danger"
              }`}
            >
              {fun.data.type}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-8">
            {fun.data.CoinName}
          </h2>

          <div className="w-full space-y-4">
            <div className="bg-surface-2/50 p-5 rounded-2xl border border-border flex justify-between items-center">
              <span className="text-muted text-sm font-medium">
                Total Amount
              </span>
              <span className="font-bold text-foreground text-xl tabular-nums">
                {money(fun.data.Amount)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-2/50 p-4 rounded-2xl border border-border">
                <span className="text-muted text-xs uppercase tracking-wider block mb-1">
                  Price / Unit
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {money(fun.data.Prise)}
                </span>
              </div>
              <div className="bg-surface-2/50 p-4 rounded-2xl border border-border">
                <span className="text-muted text-xs uppercase tracking-wider block mb-1">
                  Quantity
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {Number(fun.data.Quantity).toFixed(6)}
                </span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <span className="text-xs font-mono text-muted bg-surface-2/50 px-3 py-1 rounded-full border border-border">
                {new Date(fun.data.Date).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
