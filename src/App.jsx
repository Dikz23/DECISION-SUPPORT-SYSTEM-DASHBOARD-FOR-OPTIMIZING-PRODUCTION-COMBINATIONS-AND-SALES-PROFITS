import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import InputForm from './components/InputForm';
import KpiCards from './components/KpiCards';
import ConvergenceChart from './components/ConvergenceChart';
import RecommendationTable from './components/RecommendationTable';

const formatRupiah = (angka) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(angka || 0);

export default function App() {
  const [modal, setModal] = useState(2000000);
  const [generasi, setGenerasi] = useState(300);
  const [populasi, setPopulasi] = useState(100);
  const [loading, setLoading] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [hasil, setHasil] = useState(null);

  useEffect(() => {
    fetch('/api/baseline')
      .then((res) => res.json())
      .then((data) => setBaseline(data))
      .catch((err) => console.error('Gagal memuat data baseline:', err));
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

  const jumlahVarianTerpilih =
    hasil?.recommendations?.filter((item) => item.jumlah_beli > 0).length || 0;

  const maxProfitChart = baseline
    ? Math.max(...baseline.products.map((p) => p.profit_unit * p.max_demand), 1)
    : 1;

  const barColors = ['bg-indigo-500', 'bg-teal-500', 'bg-sky-500', 'bg-amber-500'];

  return (
    <div className="min-h-screen bg-[#e6ebf2] text-slate-800">
      {/* Header Neumorphism */}
      <header className="pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto neu-flat rounded-3xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl neu-sm flex items-center justify-center text-indigo-600">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
                OptiStock GA
              </h1>
              <p className="text-xs text-slate-500">
                Sistem Optimasi Alokasi Stok & Profit Berbasis Algoritma Genetika
              </p>
            </div>
          </div>

          <div className="neu-inset px-4 py-2 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="font-mono text-xs font-bold text-slate-700">
              NEUMORPHISM UI
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
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

        {/* TAMPILAN AWAL: PROFIL PRODUK & BASELINE */}
        {baseline && !hasil && (
          <section className="neu-flat rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Profil Produk & Data Baseline Awal
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan {baseline.summary.total_produk} varian produk sebelum optimasi dijalankan
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-xs">
                <div className="neu-inset px-4 py-2.5 rounded-2xl">
                  <span className="text-slate-500">Modal Baseline: </span>
                  <strong className="font-mono text-slate-800">
                    {formatRupiah(baseline.summary.total_modal_baseline)}
                  </strong>
                </div>
                <div className="neu-inset px-4 py-2.5 rounded-2xl">
                  <span className="text-slate-500">Profit Baseline: </span>
                  <strong className="font-mono text-teal-700">
                    {formatRupiah(baseline.summary.total_profit_baseline)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Grafik Profil Potensi Profit Maksimal per Produk
                </h3>
                <span className="text-xs text-slate-400">
                  Max Demand &times; Profit/Unit
                </span>
              </div>

              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-2">
                {baseline.products.map((prod, index) => {
                  const potensiProfit = prod.profit_unit * prod.max_demand;
                  const lebarPersen = Math.max(
                    4,
                    Math.round((potensiProfit / maxProfitChart) * 100)
                  );
                  return (
                    <div key={prod.kode_produk} className="space-y-1.5">
                      <div className="flex flex-wrap justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-800">
                          <span className="font-mono text-indigo-600 font-bold mr-2">
                            [{prod.kode_produk}]
                          </span>
                          {prod.nama_produk}
                        </span>
                        <span className="font-mono text-slate-500">
                          Demand: <strong className="text-slate-700">{prod.max_demand}</strong> |
                          Profit/unit:{' '}
                          <strong className="text-slate-700">
                            {formatRupiah(prod.profit_unit)}
                          </strong>
                        </span>
                      </div>
                      <div className="w-full neu-inset rounded-full h-3.5 p-0.5">
                        <div
                          className={`${barColors[index % barColors.length]} h-full rounded-full transition-all duration-300`}
                          style={{ width: `${lebarPersen}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* HASIL OPTIMASI GA + PERBANDINGAN BASELINE */}
        {hasil && (
          <div className="space-y-7">
            <KpiCards
              kpi={hasil.kpi}
              modalAwal={modal}
              jumlahVarianTerpilih={jumlahVarianTerpilih}
            />

            <section className="neu-flat rounded-3xl p-6 sm:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Perbandingan Baseline vs Optimasi GA
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Komparasi alokasi konvensional (Baseline) dengan hasil Algoritma Genetika
                  </p>
                </div>

                <span className="neu-sm px-4 py-2 rounded-2xl font-mono text-xs font-bold text-teal-700 self-start sm:self-auto">
                  +{formatRupiah(hasil.comparison.kenaikan_profit)} ({hasil.comparison.kenaikan_persen}%)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Grafik Perbandingan */}
                <div className="lg:col-span-5 p-5 neu-inset rounded-2xl space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Perbandingan Total Profit
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-600">Baseline</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatRupiah(hasil.comparison.baseline_profit)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-300/60 h-3.5 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-500 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                4,
                                Math.round(
                                  (hasil.comparison.baseline_profit /
                                    Math.max(hasil.comparison.ga_profit, 1)) *
                                    100
                                )
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-bold text-indigo-700">Optimasi GA</span>
                        <span className="font-mono font-bold text-teal-700">
                          {formatRupiah(hasil.comparison.ga_profit)}
                        </span>
                      </div>
                      <div className="w-full bg-indigo-200/60 h-3.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabel Perbandingan */}
                <div className="lg:col-span-7 neu-inset rounded-2xl overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Metrik</th>
                        <th className="py-3.5 px-4 text-right">Baseline</th>
                        <th className="py-3.5 px-4 text-right text-indigo-700">Optimasi GA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300/60 font-mono text-xs sm:text-sm">
                      <tr>
                        <td className="py-3.5 px-4 font-sans font-semibold text-slate-700">
                          Modal Terpakai
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-600">
                          {formatRupiah(hasil.comparison.baseline_modal)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                          {formatRupiah(hasil.comparison.ga_modal)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-sans font-semibold text-slate-700">
                          Total Unit Stok
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-600">
                          {hasil.comparison.baseline_unit.toLocaleString('id-ID')} unit
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                          {hasil.comparison.ga_unit.toLocaleString('id-ID')} unit
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-sans font-semibold text-slate-700">
                          Estimasi Profit
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-600">
                          {formatRupiah(hasil.comparison.baseline_profit)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-teal-700">
                          {formatRupiah(hasil.comparison.ga_profit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <ConvergenceChart data={hasil.convergence} />
            <RecommendationTable recommendations={hasil.recommendations} />
          </div>
        )}
      </main>
    </div>
  );
}