import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function RecommendationTable({ recommendations }) {
  const [hanyaDibeli, setHanyaDibeli] = useState(true);
  const [cariProduk, setCariProduk] = useState('');

  const dataTabel = recommendations.filter((item) => {
    const keyword = cariProduk.toLowerCase();
    const cocokNama = item.nama_produk.toLowerCase().includes(keyword);
    const cocokKode = item.kode_produk ? item.kode_produk.toLowerCase().includes(keyword) : false;
    const cocokKategori = item.kategori ? item.kategori.toLowerCase().includes(keyword) : false;
    const cocokJumlah = hanyaDibeli ? item.jumlah_beli > 0 : true;
    return (cocokNama || cocokKode || cocokKategori) && cocokJumlah;
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Rekomendasi Alokasi Pembelian Produk</h2>
          <p className="text-xs text-slate-500 mt-0.5">Daftar kuantitas optimal setiap produk berdasarkan batas permintaan</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Pencarian Produk */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode, nama, kategori..."
              value={cariProduk}
              onChange={(e) => setCariProduk(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Checkbox Filter 0 Unit */}
          <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-700 cursor-pointer select-none hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={hanyaDibeli}
              onChange={(e) => setHanyaDibeli(e.target.checked)}
              className="rounded accent-emerald-600 w-3.5 h-3.5"
            />
            Sembunyikan 0 unit
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200/80">
              <th className="py-3.5 px-5">Produk</th>
              <th className="py-3.5 px-5 text-right">Modal / Unit</th>
              <th className="py-3.5 px-5 text-right">Profit / Unit</th>
              <th className="py-3.5 px-5 text-center">Maks. Permintaan</th>
              <th className="py-3.5 px-5 text-center">Rekomendasi Beli</th>
              <th className="py-3.5 px-5 text-right">Total Modal</th>
              <th className="py-3.5 px-5 text-right">Total Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {dataTabel.length > 0 ? (
              dataTabel.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      {item.kode_produk && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
                          {item.kode_produk}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{item.nama_produk}</p>
                        {item.kategori && (
                          <p className="text-xs text-slate-400 mt-0.5">{item.kategori}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-right text-slate-600">{formatRupiah(item.modal_unit)}</td>
                  <td className="py-3.5 px-5 text-right text-slate-600">{formatRupiah(item.profit_unit)}</td>
                  <td className="py-3.5 px-5 text-center text-slate-500">{item.max_demand}</td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-block font-semibold px-3 py-1 rounded-full text-xs ${
                      item.jumlah_beli > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.jumlah_beli} unit
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-medium text-slate-800">{formatRupiah(item.subtotal_modal)}</td>
                  <td className="py-3.5 px-5 text-right font-bold text-emerald-600">
                    {formatRupiah(item.subtotal_profit)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-400 text-sm">
                  Tidak ada produk yang sesuai dengan filter pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}