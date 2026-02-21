import type { SalesTrendPoint } from "../../services/dashboardService";

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GH", { month: "short", day: "numeric" });
}

interface SalesTrendChartProps {
  data: SalesTrendPoint[];
  isDark: boolean;
}

export function SalesTrendChart({ data, isDark }: SalesTrendChartProps) {
  if (!data.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className={`text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          No sales data for this period
        </p>
      </div>
    );
  }

  const W = 600;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 36, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.total_sales), 1);
  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;

  const pts = data.map((d, i) => ({
    x: PAD.left + (data.length > 1 ? i * xStep : chartW / 2),
    y: PAD.top + chartH - (d.total_sales / maxVal) * chartH,
    ...d,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${PAD.top + chartH} L ${pts[0].x} ${PAD.top + chartH} Z`;

  const stroke = "#14b8a6";
  const fill = isDark ? "rgba(20,184,166,0.12)" : "rgba(20,184,166,0.08)";
  const axisColor = isDark ? "#334155" : "#e2e8f0";
  const labelColor = isDark ? "#64748b" : "#94a3b8";
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      {yTicks.map((t) => {
        const y = PAD.top + chartH - t * chartH;
        return (
          <g key={t}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke={axisColor}
              strokeWidth={1}
            />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={11} fill={labelColor}>
              {t === 0 ? "0" : `${((t * maxVal) / 1000).toFixed(0)}k`}
            </text>
          </g>
        );
      })}

      <path d={areaD} fill={fill} />
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill={stroke}
          stroke={isDark ? "#0f172a" : "#fff"}
          strokeWidth={2}
        />
      ))}

      {pts
        .filter((_, i) => data.length <= 10 || i % Math.ceil(data.length / 8) === 0)
        .map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize={11} fill={labelColor}>
            {formatShortDate(p.date)}
          </text>
        ))}
    </svg>
  );
}
