import React from 'react';
import { TrendingUp, Wallet, PiggyBank, Package } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function KpiCards({ kpi, modalAwal, jumlahVarianTerpilih }) {
  const persentaseModal =
    modalAwal > 0 ? ((kpi.modal_terpakai / modalAwal) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Estimasi Profit */}
      <div className="neu-flat rounded-3xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Estimasi Profit
          </span>
          <div className="w-10 h-10 rounded-2xl neu-sm flex items-center justify-center text-teal-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-mono font-bold text-teal-700 mt-4">
          {formatRupiah(kpi.total_profit)}
        </p>
        <p className="text-xs text-slate-500 mt-2">Keuntungan bersih maksimal</p>
      </div>

      {/* Modal Terpakai */}
      <div className="neu-flat rounded-3xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Modal Terpakai
          </span>
          <div className="w-10 h-10 rounded-2xl neu-sm flex items-center justify-center text-indigo-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-mono font-bold text-slate-800 mt-4">
          {formatRupiah(kpi.modal_terpakai)}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          <span className="font-mono font-bold text-indigo-600">{persentaseModal}%</span> terserap dari modal
        </p>
      </div>

      {/* Sisa Modal */}
      <div className="neu-flat rounded-3xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sisa Modal
          </span>
          <div className="w-10 h-10 rounded-2xl neu-sm flex items-center justify-center text-amber-600">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-mono font-bold text-slate-800 mt-4">
          {formatRupiah(kpi.sisa_modal)}
        </p>
        <p className="text-xs text-slate-500 mt-2">Anggaran belum terpakai</p>
      </div>

      {/* Total Unit Stok */}
      <div className="neu-flat rounded-3xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Unit Stok
          </span>
          <div className="w-10 h-10 rounded-2xl neu-sm flex items-center justify-center text-purple-600">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-mono font-bold text-slate-800 mt-4">
          {kpi.total_unit.toLocaleString('id-ID')}{' '}
          <span className="text-sm font-sans font-semibold text-slate-500">unit</span>
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Dari <strong className="text-slate-700">{jumlahVarianTerpilih}</strong> varian produk terpilih
        </p>
      </div>
    </div>
  );
}