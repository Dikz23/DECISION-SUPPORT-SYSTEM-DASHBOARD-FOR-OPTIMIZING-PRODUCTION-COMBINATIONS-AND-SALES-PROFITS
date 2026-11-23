import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function RecommendationTable({ recommendations }) {
  const [hanyaDibeli, setHanyaDibeli] = useState(true);
  const [cariProduk, setCariProduk] = useState('');

  const dataTabel = recommendations.filter((item) => {
    const keyword = cariProduk.toLowerCase();
    const cocokNama = item.nama_produk.toLowerCase().includes(keyword);
    const cocokKode = item.kode_produk
      ? item.kode_produk.toLowerCase().includes(keyword)
      : false;
    const cocokKategori = item.kategori
      ? item.kategori.toLowerCase().includes(keyword)
      : false;
    const cocokJumlah = hanyaDibeli ? item.jumlah_beli > 0 : true;
    return (cocokNama || cocokKode || cocokKategori) && cocokJumlah;
  });

  return (
    <section className="neu-flat rounded-3xl p-6 sm:p-7 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Rincian Rekomendasi Stok Produk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar kuantitas optimal & total modal per produk dengan batas kuantitas &le; max demand
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Pencarian Produk */}
          <div className="neu-inset rounded-2xl px-3.5 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari kode / nama produk..."
              value={cariProduk}
              onChange={(e) => setCariProduk(e.target.value)}
              className="w-full sm:w-56 bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Filter 0 Unit */}
          <label className="neu-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hanyaDibeli}
              onChange={(e) => setHanyaDibeli(e.target.checked)}
              className="accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
            />
            Sembunyikan 0 unit
          </label>
        </div>
      </div>

      <div className="neu-inset rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Produk</th>
                <th className="py-3.5 px-5 text-right">Modal / Unit</th>
                <th className="py-3.5 px-5 text-right">Profit / Unit</th>
                <th className="py-3.5 px-5 text-center">Max Demand</th>
                <th className="py-3.5 px-5 text-center">Rekomendasi Beli</th>
                <th className="py-3.5 px-5 text-right">Total Modal</th>
                <th className="py-3.5 px-5 text-right">Total Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/60 text-sm">
              {dataTabel.length > 0 ? (
                dataTabel.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/40 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {item.kode_produk && (
                          <span className="px-2.5 py-1 rounded-xl neu-sm font-mono text-xs font-bold text-indigo-600 shrink-0">
                            {item.kode_produk}
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{item.nama_produk}</p>
                          {item.kategori && (
                            <p className="text-xs text-slate-500 mt-0.5">{item.kategori}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-xs sm:text-sm text-slate-600">
                      {formatRupiah(item.modal_unit)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-xs sm:text-sm text-slate-600">
                      {formatRupiah(item.profit_unit)}
                    </td>
                    <td className="py-3.5 px-5 text-center font-mono text-xs sm:text-sm font-semibold text-slate-600">
                      {item.max_demand}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-block font-mono font-bold px-3 py-1 rounded-xl text-xs ${
                          item.jumlah_beli > 0
                            ? 'neu-sm text-indigo-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.jumlah_beli} unit
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-xs sm:text-sm font-bold text-slate-800">
                      {formatRupiah(item.subtotal_modal)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-xs sm:text-sm font-bold text-teal-700">
                      {formatRupiah(item.subtotal_profit)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500 text-sm">
                    Tidak ada produk yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}