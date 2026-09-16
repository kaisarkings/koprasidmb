import React from 'react';
import { TopSantriStat } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { Award, Trophy, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { StudentAvatar } from '../common/StudentAvatar';

interface TopSantriTableProps {
  topSantri: TopSantriStat[];
}

export const TopSantriTable: React.FC<TopSantriTableProps> = ({ topSantri }) => {
  const navigate = useNavigate();

  if (!topSantri || topSantri.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-400 text-xs">
        Belum ada data transaksi santri
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs">1</div>;
    if (rank === 2) return <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs">2</div>;
    if (rank === 3) return <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs">3</div>;
    return <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center">{rank}</div>;
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Top 10 Santri Paling Sering Jajan</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Statistik Koperasi</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-2 px-2 text-center">Rank</th>
              <th className="py-2 px-3">Santri</th>
              <th className="py-2 px-3 text-center">Frekuensi</th>
              <th className="py-2 px-3 text-right">Total Jajan</th>
              <th className="py-2 px-3 text-right">Sisa Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {topSantri.slice(0, 10).map((s, idx) => (
              <tr
                key={s.student_id ? `top-santri-${s.student_id}-${idx}` : `top-santri-rank-${idx}`}
                onClick={() => navigate(`/santri/${s.student_id}`)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-2 text-center">
                  <div className="flex justify-center">{getRankBadge(idx + 1)}</div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <StudentAvatar
                      src={s.avatar_url}
                      name={s.student_name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{s.student_name}</p>
                      <p className="text-[10px] text-slate-400">{s.nis} • {s.class_name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    {s.transaction_count}x
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                  {formatRupiah(s.total_spent)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(s.current_balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
