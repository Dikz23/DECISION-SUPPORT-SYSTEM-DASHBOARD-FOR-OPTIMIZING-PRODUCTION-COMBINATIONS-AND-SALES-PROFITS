import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatRupiah } from '../utils/formatters';

export default function ConvergenceChart({ data }) {
  return (
    <section className="neu-flat rounded-3xl p-6 sm:p-7 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Kurva Konvergensi Algoritma Genetika
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evolusi peningkatan nilai profit terbaik (fitness) dari generasi awal hingga akhir
          </p>
        </div>
        <span className="neu-sm px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-indigo-600 self-start sm:self-auto">
          FITNESS / GENERASI
        </span>
      </div>

      <div className="h-72 w-full neu-inset rounded-2xl p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
            <XAxis
              dataKey="generasi"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              label={{
                value: 'Generasi ke-',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${(val / 1000000).toFixed(1)}jt`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#e6ebf2',
                borderColor: '#cbd5e1',
                borderRadius: '16px',
                boxShadow: '6px 6px 14px #c5cdd9, -6px -6px 14px #ffffff',
                color: '#1e293b',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
              }}
              formatter={(value) => [formatRupiah(value), 'Profit Terbaik']}
              labelFormatter={(label) => `Generasi ke-${label}`}
            />
            <Line
              type="monotone"
              dataKey="fitness"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#0d9488', stroke: '#e6ebf2', strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}