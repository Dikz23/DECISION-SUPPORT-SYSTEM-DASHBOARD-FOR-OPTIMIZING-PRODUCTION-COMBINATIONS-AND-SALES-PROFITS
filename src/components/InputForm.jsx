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
    { label: 'Rp 1 Juta', value: 1000000 },
    { label: 'Rp 2 Juta', value: 2000000 },
    { label: 'Rp 5 Juta', value: 5000000 },
    { label: 'Rp 10 Juta', value: 10000000 },
  ];

  return (
    <section className="neu-flat rounded-3xl p-6 sm:p-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl neu-sm flex items-center justify-center text-indigo-600 font-mono font-bold text-sm">
            01
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Konfigurasi Modal & Parameter GA
            </h2>
            <p className="text-xs text-slate-500">
              Atur batas modal belanja untuk mencari kombinasi alokasi stok dengan profit tertinggi
            </p>
          </div>
        </div>

        {hasResult && (
          <button
            type="button"
            onClick={onReset}
            className="neu-btn inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 px-4 py-2.5 rounded-2xl cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Hasil
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Input Nominal Modal */}
          <div className="lg:col-span-7 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Modal Tersedia (Default: Rp 2.000.000)
            </label>

            <div className="neu-inset rounded-2xl px-4 py-2 flex items-center gap-3">
              <span className="font-mono font-bold text-sm text-indigo-600 select-none">
                Rp
              </span>
              <input
                type="number"
                min="100000"
                step="100000"
                required
                value={modal}
                onChange={(e) => setModal(Number(e.target.value))}
                className="w-full bg-transparent py-1.5 text-slate-800 font-mono text-xl font-bold focus:outline-none"
              />
            </div>

            {/* Tombol Pilihan Cepat */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="text-xs font-medium text-slate-500 mr-1">Cepat pilih:</span>
              {presetModal.map((preset) => {
                const active = modal === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setModal(preset.value)}
                    className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition ${
                      active
                        ? 'neu-btn-active text-indigo-600'
                        : 'neu-btn text-slate-700 hover:text-indigo-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kolom Tombol Aksi */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:pt-7">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="neu-btn flex-1 flex items-center justify-center gap-2 text-slate-700 hover:text-indigo-600 px-4 py-3.5 rounded-2xl text-sm font-semibold cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Parameter GA</span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="neu-btn flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white disabled:opacity-50 px-6 py-3.5 rounded-2xl text-sm font-bold cursor-pointer"
              style={
                !loading
                  ? {
                      backgroundColor: '#4f46e5',
                      boxShadow: '5px 5px 12px #b8c2d1, -5px -5px 12px #ffffff',
                    }
                  : undefined
              }
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{loading ? 'Memproses...' : 'Jalankan Optimasi'}</span>
            </button>
          </div>
        </div>

        {/* Panel Parameter Lanjutan */}
        {showAdvanced && (
          <div className="pt-5 border-t border-slate-300/70 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Jumlah Generasi
              </label>
              <div className="neu-inset rounded-2xl px-4 py-2.5">
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={generasi}
                  onChange={(e) => setGenerasi(Number(e.target.value))}
                  className="w-full bg-transparent font-mono text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 pl-1">Default: 300 generasi</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Ukuran Populasi
              </label>
              <div className="neu-inset rounded-2xl px-4 py-2.5">
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={populasi}
                  onChange={(e) => setPopulasi(Number(e.target.value))}
                  className="w-full bg-transparent font-mono text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 pl-1">Default: 100 kromosom</p>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}