import React from 'react';
import { TrendingUp, Wallet, PiggyBank, Package } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function KpiCards({ kpi, modalAwal, jumlahVarianTerpilih }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estimasi Profit</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-600 mt-3">
          {formatRupiah(kpi.total_profit)}
        </p>
        <p className="text-xs text-slate-400 mt-1">Keuntungan bersih maksimal</p>
      </div>

      <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Modal Terpakai</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-3">
          {formatRupiah(kpi.modal_terpakai)}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          <span className="font-semibold text-blue-600">
            {((kpi.modal_terpakai / modalAwal) * 100).toFixed(1)}%
          </span> terserap dari anggaran
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sisa Modal</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-3">
          {formatRupiah(kpi.sisa_modal)}
        </p>
        <p className="text-xs text-slate-400 mt-1">Saldo anggaran tidak terpakai</p>
      </div>

      <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Unit Stok</span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-3">
          {kpi.total_unit.toLocaleString('id-ID')} <span className="text-sm font-medium text-slate-400">unit</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">Dari {jumlahVarianTerpilih} varian produk terpilih</p>
      </div>
    </div>
  );
}