interface CartItemProps {
  name: string;
  pricePerUnit: number;
  quantity: number;
  maxQty: number;
  isDark: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

function fmt(n: number) {
  return `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CartItem({
  name,
  pricePerUnit,
  quantity,
  maxQty,
  isDark,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemProps) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 ${isDark ? "border-slate-800" : "border-slate-100"
        }`}
    >
      {/* Remove */}
      <button
        onClick={onRemove}
        className={`mt-0.5 w-6 h-6 flex items-center justify-center rounded-full shrink-0 transition-colors ${isDark
            ? "text-slate-600 hover:bg-red-500/10 hover:text-red-400"
            : "text-slate-300 hover:bg-red-50 hover:text-red-400"
          }`}
        title="Remove item"
      >
        <i className="fa-solid fa-xmark text-xs" />
      </button>

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug truncate ${isDark ? "text-white" : "text-slate-900"
            }`}
        >
          {name}
        </p>
        <p
          className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          {fmt(pricePerUnit)} / unit
        </p>
      </div>

      {/* Qty controls + line total */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span
          className={`text-sm font-semibold ${isDark ? "text-teal-400" : "text-teal-600"
            }`}
        >
          {fmt(pricePerUnit * quantity)}
        </span>
        <div
          className={`flex items-center gap-0 rounded-xl overflow-hidden border ${isDark ? "border-slate-700" : "border-slate-200"
            }`}
        >
          <button
            onClick={onDecrement}
            disabled={quantity <= 1}
            className={`px-2.5 py-1 text-sm transition-colors disabled:opacity-40 ${isDark
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
          >
            −
          </button>
          <span
            className={`px-3 py-1 text-sm font-semibold min-w-8 text-center ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
              }`}
          >
            {quantity}
          </span>
          <button
            onClick={onIncrement}
            disabled={quantity >= maxQty}
            className={`px-2.5 py-1 text-sm transition-colors disabled:opacity-40 ${isDark
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
