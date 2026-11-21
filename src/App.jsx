import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InputForm from './components/InputForm';
import KpiCards from './components/KpiCards';
import ConvergenceChart from './components/ConvergenceChart';
import RecommendationTable from './components/RecommendationTable';

const formatRupiah = (angka) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka || 0);

export default function App() {
  const [modal, setModal] = useState(15000000);
  const [generasi, setGenerasi] = useState(300);
  const [populasi, setPopulasi] = useState(100);
  const [loading, setLoading] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [hasil, setHasil] = useState(null);

  // Muat data awal & grafik profil produk dari data_dashboard_dika.csv
  useEffect(() => {
    fetch('/api/baseline')
      .then((res) => res.json())
      .then((data) => setBaseline(data))
      .catch((err) => console.error('Gagal memuat data baseline Dika:', err));
  }, []);

  const jalankanOptimasi = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modal, generasi, populasi }),
      });
      if (!response.ok) throw new Error('Terjadi kesalahan pada server');
      const data = await response.json();
      setHasil(data);
    } catch (error) {
      alert('Gagal memproses optimasi. Pastikan server backend berjalan!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const jumlahVarianTerpilih = hasil?.recommendations?.filter((item) => item.jumlah_beli > 0).length || 0;
  const maxProfitChart = baseline
    ? Math.max(...baseline.products.map((p) => p.profit_unit * p.max_demand), 1)
    : 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <InputForm
          modal={modal}
          setModal={setModal}
          generasi={generasi}
          setGenerasi={setGenerasi}
          populasi={populasi}
          setPopulasi={setPopulasi}
          loading={loading}
          onSubmit={jalankanOptimasi}
          hasResult={Boolean(hasil)}
          onReset={() => setHasil(null)}
        />

        {/* BAGIAN 1: TAMPILAN AWAL - GRAFIK PROFIL PRODUK & DATA BASELINE (FILE DIKA) */}
        {baseline && !hasil && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Profil Produk & Data Baseline Awal</h2>
                <p className="text-sm text-slate-500">
                  Sumber: <span className="font-medium text-slate-700">data_dashboard_dika.csv</span> ({baseline.summary.total_produk} varian produk)
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-slate-100 px-3 py-1.5 rounded-lg">
                  <span className="text-slate-500">Modal Baseline: </span>
                  <strong className="text-slate-800">{formatRupiah(baseline.summary.total_modal_baseline)}</strong>
                </div>
                <div className="bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <span className="text-emerald-700">Profit Baseline: </span>
                  <strong className="text-emerald-800">{formatRupiah(baseline.summary.total_profit_baseline)}</strong>
                </div>
              </div>
            </div>

            {/* Grafik Profil Potensi Profit & Demand Produk */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Grafik Profil Potensi Profit Maksimal per Produk</h3>
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2">
                {baseline.products.map((prod) => {
                  const potensiProfit = prod.profit_unit * prod.max_demand;
                  const lebarPersen = Math.round((potensiProfit / maxProfitChart) * 100);
                  return (
                    <div key={prod.kode_produk} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-md">
                          [{prod.kode_produk}] {prod.nama_produk}
                        </span>
                        <span className="text-slate-500">
                          Demand: <strong>{prod.max_demand}</strong> | Profit/unit: <strong>{formatRupiah(prod.profit_unit)}</strong>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className="bg-slate-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${lebarPersen}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* BAGIAN 2: HASIL OPTIMASI GA (HARYA) + GRAFIK & TABEL PERBANDINGAN DENGAN BASELINE */}
        {hasil && (
          <div className="space-y-6">
            <KpiCards
              kpi={hasil.kpi}
              modalAwal={modal}
              jumlahVarianTerpilih={jumlahVarianTerpilih}
            />

            {/* Grafik & Tabel Perbandingan Baseline (Dika) vs Hasil GA (Harya) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Perbandingan Baseline vs Optimasi GA</h2>
                  <p className="text-sm text-slate-500">
                    Komparasi alokasi konvensional (Baseline) dengan hasil algoritma genetika
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Peningkatan Profit: +{formatRupiah(hasil.comparison.kenaikan_profit)} ({hasil.comparison.kenaikan_persen}%)
                </span>
              </div>

              {/* Grafik Batang Perbandingan Profit & Modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Perbandingan Total Profit</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Baseline</span>
                        <span className="font-semibold">{formatRupiah(hasil.comparison.baseline_profit)}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full">
                        <div
                          className="bg-slate-500 h-3 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round((hasil.comparison.baseline_profit / Math.max(hasil.comparison.ga_profit, 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-emerald-700 font-medium">Optimasi GA</span>
                        <span className="font-bold text-emerald-700">{formatRupiah(hasil.comparison.ga_profit)}</span>
                      </div>
                      <div className="w-full bg-emerald-100 h-3 rounded-full">
                        <div className="bg-emerald-600 h-3 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabel Ringkasan Perbandingan */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                        <th className="py-2">Metrik</th>
                        <th className="py-2 text-right">Baseline</th>
                        <th className="py-2 text-right text-emerald-700">Optimasi GA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 font-medium">Modal Terpakai</td>
                        <td className="py-2.5 text-right">{formatRupiah(hasil.comparison.baseline_modal)}</td>
                        <td className="py-2.5 text-right font-semibold">{formatRupiah(hasil.comparison.ga_modal)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Total Unit Stok</td>
                        <td className="py-2.5 text-right">{hasil.comparison.baseline_unit.toLocaleString('id-ID')} unit</td>
                        <td className="py-2.5 text-right font-semibold">{hasil.comparison.ga_unit.toLocaleString('id-ID')} unit</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Estimasi Profit</td>
                        <td className="py-2.5 text-right">{formatRupiah(hasil.comparison.baseline_profit)}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700">{formatRupiah(hasil.comparison.ga_profit)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <ConvergenceChart data={hasil.convergence} />
            <RecommendationTable recommendations={hasil.recommendations} />
          </div>
        )}
      </main>
    </div>
  );
}