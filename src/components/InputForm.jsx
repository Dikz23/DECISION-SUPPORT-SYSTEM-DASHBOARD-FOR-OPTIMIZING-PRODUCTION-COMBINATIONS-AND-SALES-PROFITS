import React, { useState } from 'react';
import { Play, SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

export default function InputForm({
  modal,
  setModal,
  generasi,
  setGenerasi,
  populasi,
  setPopulasi,
  loading,
  onSubmit,
  hasResult,
  onReset
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const presetModal = [
    { label: 'Rp 5 Juta', value: 5000000 },
    { label: 'Rp 10 Juta', value: 10000000 },
    { label: 'Rp 25 Juta', value: 25000000 },
    { label: 'Rp 50 Juta', value: 50000000 },
  ];

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Konfigurasi Anggaran & Parameter</h2>
          <p className="text-xs text-slate-500">Tentukan batas modal belanja untuk mencari kombinasi profit tertinggi</p>
        </div>
        {hasResult && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Hasil
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kolom Input Nominal Modal */}
          <div className="lg:col-span-7 space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Modal Tersedia
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 font-semibold text-base select-none">
                Rp
              </span>
              <input
                type="number"
                min="100000"
                step="100000"
                required
                value={modal}
                onChange={(e) => setModal(Number(e.target.value))}
                className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-slate-900 text-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Tombol Pilihan Cepat */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 mr-1">Cepat pilih:</span>
              {presetModal.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setModal(preset.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    modal === preset.value
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kolom Tombol Aksi */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-3.5 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Parameter GA</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-3.5 rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{loading ? 'Memproses...' : 'Jalankan Optimasi'}</span>
            </button>
          </div>
        </div>

        {/* Panel Parameter GA Lanjutan */}
        {showAdvanced && (
          <div className="pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 -mx-6 -mb-6 px-6 py-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Jumlah Generasi (Iterasi Evolusi)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={generasi}
                onChange={(e) => setGenerasi(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Semakin tinggi generasi, hasil semakin konvergen (default: 100)</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Ukuran Populasi (Jumlah Kromosom)
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={populasi}
                onChange={(e) => setPopulasi(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Banyaknya kandidat solusi per generasi (default: 50)</p>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}