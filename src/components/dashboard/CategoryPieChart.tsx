import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../types';
import { CATEGORIES } from '../../constants';
import { formatRupiah } from '../../utils/formatters';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryPieChartProps {
  transactions: Transaction[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#6b7280'];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions }) => {
  const pieData = React.useMemo(() => {
    const map = new Map<string, number>();

    CATEGORIES.forEach((c) => map.set(c.name, 0));

    (transactions || []).forEach((t) => {
      const current = map.get(t.category) || 0;
      map.set(t.category, current + t.amount);
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  const totalExpense = pieData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percentage = totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-bold text-slate-200">{name}</p>
          <p className="text-emerald-400 font-semibold mt-0.5">{formatRupiah(value)} ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-emerald-500" />
          Statistik Jajanan Terlaris
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">Per Kategori</span>
      </div>

      <div className="h-64 w-full">
        {totalExpense > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            Belum ada data jajanan
          </div>
        )}
      </div>
    </div>
  );
};
