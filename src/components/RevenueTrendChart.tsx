"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Format angka ke Rupiah ringkas (misal: 500rb / 1.2M)
const formatRupiah = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}rb`;
  }
  return `Rp ${value}`;
};

interface DailyTrend {
  date: string;
  revenues: number;
  netIncomes: number;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }); // Hasil: "28 Agt"
};

export default function RevenueTrendChart({ data }: { data: DailyTrend[] }) {
  return (
    <div className="w-full h-[350px] p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-800">
        Tren Omzet & Laba Bersih 7 Hari Terakhir
      </h3>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
        Loss Bahan Baku tidak termasuk
      </span>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[550px] h-[320px]">
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              // margin={{ top: 10, right: 10, left: 15, bottom: 20 }}
            >
              <defs>
                {/* Gradient Warna Omzet */}
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                {/* Gradient Warna Laba Bersih */}
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
                dy={12}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />

              <YAxis
                width={78}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={formatRupiah}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />

              <Tooltip
                formatter={(value) => {
                  const numericValue =
                    typeof value === "number" ? value : Number(value) || 0;
                  return [
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(numericValue),
                  ];
                }}
                labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                contentStyle={{ borderRadius: "8px", borderColor: "#e2e8f0" }}
              />

              <Area
                type="monotone"
                dataKey="revenues"
                name="Omzet"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />

              <Area
                type="monotone"
                dataKey="netIncomes"
                name="Laba Bersih"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNet)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
