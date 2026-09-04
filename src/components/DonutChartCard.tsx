import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export interface DonutChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  data: DonutChartDataItem[];
  centerLabel?: string;
  unit?: string; // Misal: "Item", "Tx", "Rp"
}

export const DonutChartCard: React.FC<DonutChartCardProps> = ({
  title,
  data,
  centerLabel = 'Total',
  unit = 'Item',
}) => {
  // Hitung total secara otomatis dari props data
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);
  const hasData = totalValue > 0;

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>

      <div className="relative h-[240px] w-full">
        {/* TEXT DI TENGAH DONUT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
          <span className="text-2xl font-bold text-gray-800">
            {hasData ? totalValue.toLocaleString('id-ID') : 0}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {centerLabel}
          </span>
        </div>

        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                cornerRadius={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [
                  `${Number(value || 0).toLocaleString('id-ID')} ${unit}`,
                  'Jumlah',
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-xs font-medium text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Belum ada data penjualan
          </div>
        )}
      </div>
    </div>
  );
};