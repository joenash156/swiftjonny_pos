import { type Product } from "../../services/productService";

interface ProductCardProps {
  product: Product;
  cartQty: number;
  isDark: boolean;
  onAdd: () => void;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function fmt(n: number) {
  return `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ProductCard({ product, cartQty, isDark, onAdd }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const maxReached = cartQty >= product.stock;
  const disabled = isOutOfStock || maxReached;

  const imgSrc = product.image_url
    ? product.image_url.startsWith("http")
      ? product.image_url
      : `${BASE_URL}/uploads/products/${product.image_url}`
    : null;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 ${isDark
        ? "bg-slate-900/70 border-slate-800 hover:border-slate-700"
        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
        } ${disabled ? "opacity-60" : ""}`}
    >
      {/* Image */}
      <div
        className={`h-28 flex items-center justify-center shrink-0 ${isDark ? "bg-slate-800/60" : "bg-slate-50"
          }`}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="h-full w-full object-top object-cover"
          />
        ) : (
          <i
            className={`fa-solid fa-box text-2xl ${isDark ? "text-slate-700" : "text-slate-300"
              }`}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <p
          className={`text-sm font-semibold leading-tight line-clamp-2 ${isDark ? "text-white" : "text-slate-900"
            }`}
        >
          {product.name}
        </p>
        <p
          className={`text-xs truncate ${isDark ? "text-slate-500" : "text-slate-400"
            }`}
        >
          {product.category_name}
        </p>

        <div className="flex flex-col space-y-1 items-center justify-between mt-auto pt-2">
          <span
            className={`text-sm font-bold ${isDark ? "text-teal-400" : "text-teal-600"
              }`}
          >
            {fmt(product.price)}
          </span>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isOutOfStock
              ? isDark
                ? "bg-red-500/10 text-red-400"
                : "bg-red-50 text-red-500"
              : isDark
                ? "bg-slate-800 text-slate-500"
                : "bg-slate-100 text-slate-500"
              }`}
          >
            {isOutOfStock ? "Out of stock" : `${product.stock % 1 === 0 ? product.stock : product.stock.toFixed(1)} left`}
          </span>
        </div>

        <button
          disabled={disabled}
          onClick={onAdd}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${cartQty > 0
            ? "bg-teal-600 hover:bg-teal-700 text-white"
            : disabled
              ? isDark
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
              : isDark
                ? "bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white"
                : "bg-slate-100 hover:bg-teal-600 text-slate-700 hover:text-white"
            }`}
        >
          {cartQty > 0 ? (
            <>
              <i className="fa-solid fa-check text-[10px]" />
              In cart ({cartQty % 1 === 0 ? cartQty : cartQty.toFixed(1)})
            </>
          ) : disabled ? (
            isOutOfStock ? "Out of stock" : "Max reached"
          ) : (
            <>
              <i className="fa-solid fa-plus text-[10px]" />
              Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
