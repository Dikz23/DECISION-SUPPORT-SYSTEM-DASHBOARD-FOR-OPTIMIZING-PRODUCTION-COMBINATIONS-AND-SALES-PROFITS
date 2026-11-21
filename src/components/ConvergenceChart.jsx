import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatRupiah } from '../utils/formatters';

export default function ConvergenceChart({ data }) {
  return (
    <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-bold text-slate-900">Grafik Konvergensi Algoritma Genetika</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Evolusi peningkatan nilai profit terbaik (fitness) dari generasi awal hingga akhir
        </p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="generasi"
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              tickLine={false}
              label={{ value: 'Generasi ke-', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${(val / 1000000).toFixed(1)} jt`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: '#0f172a'
              }}
              formatter={(value) => [formatRupiah(value), 'Profit Terbaik']}
              labelFormatter={(label) => `Generasi ke-${label}`}
            />
            <Line
              type="monotone"
              dataKey="fitness"
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#059669' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}