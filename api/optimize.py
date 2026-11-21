import os
import sys
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(CURRENT_DIR)
sys.path.append(CURRENT_DIR)

from ga_engine import jalankan_ga, df_produk as df_harya

app = Flask(__name__)
CORS(app)

def hitung_baseline(df_dika, batas_modal=None):
    df = df_dika.drop_duplicates(subset=['kode_produk']).copy()

    if 'unit_baseline' in df.columns:
        df['unit_base'] = pd.to_numeric(df['unit_baseline'], errors='coerce').fillna(0).astype(int)
    elif 'terjual_rata2' in df.columns:
        df['unit_base'] = pd.to_numeric(df['terjual_rata2'], errors='coerce').fillna(0).astype(int)
    else:
        df['unit_base'] = (df['max_demand'] * 0.5).astype(int)

    df['modal_base'] = df['unit_base'] * df['modal_unit']
    df['profit_base'] = df['unit_base'] * df['profit_unit']

    if batas_modal is not None and df['modal_base'].sum() > batas_modal:
        rasio = batas_modal / df['modal_base'].sum()
        df['unit_base'] = (df['unit_base'] * rasio).astype(int)
        df['modal_base'] = df['unit_base'] * df['modal_unit']
        df['profit_base'] = df['unit_base'] * df['profit_unit']

    return df

@app.route('/api/baseline', methods=['GET'])
def get_baseline():
    df_dika = pd.read_csv('data_dashboard_dika.csv')
    df_base = hitung_baseline(df_dika)

    profil_produk = []
    for _, row in df_base.iterrows():
        profil_produk.append({
            "kode_produk": str(row['kode_produk']),
            "nama_produk": str(row['nama_produk']),
            "kategori": str(row.get('kategori_produk', 'Umum')),
            "modal_unit": int(row['modal_unit']),
            "profit_unit": int(row['profit_unit']),
            "max_demand": int(row['max_demand']),
            "unit_baseline": int(row['unit_base']),
            "modal_baseline": int(row['modal_base']),
            "profit_baseline": int(row['profit_base']),
        })

    total_modal_base = int(df_base['modal_base'].sum())
    total_profit_base = int(df_base['profit_base'].sum())

    return jsonify({
        "summary": {
            "total_produk": len(df_base),
            "total_unit_baseline": int(df_base['unit_base'].sum()),
            "total_modal_baseline": total_modal_base,
            "total_profit_baseline": total_profit_base,
            "roi_baseline": round((total_profit_base / total_modal_base) * 100, 2) if total_modal_base > 0 else 0
        },
        "products": profil_produk
    })

@app.route('/api/optimize', methods=['POST'])
@app.route('/', methods=['POST'])
def optimize():
    try:
        data_input = request.json or {}
        total_modal = int(data_input.get('modal', 15000000))
        generasi = int(data_input.get('generasi', 300))
        populasi = int(data_input.get('populasi', 100))

        df_dika = pd.read_csv('data_dashboard_dika.csv')
        df_base = hitung_baseline(df_dika, batas_modal=total_modal)
        base_map = df_base.set_index('kode_produk').to_dict(orient='index')

        hasil_ga = jalankan_ga(
            df=df_harya,
            batas_modal=total_modal,
            pop_size=populasi,
            generations=generasi,
            crossover_rate=0.8,
            mutation_rate=0.1,
            seed=42
        )

        rekomendasi_list = []
        total_unit_ga = 0

        for item in hasil_ga['tabel_rekomendasi']:
            kode = item['kode_produk']
            jumlah_beli = int(item['jumlah_produksi_optimal'])
            total_unit_ga += jumlah_beli

            info_dika = base_map.get(kode, {})
            unit_base = int(info_dika.get('unit_base', 0))
            profit_base = int(info_dika.get('profit_base', 0))
            modal_base = int(info_dika.get('modal_base', 0))

            rekomendasi_list.append({
                "kode_produk": str(kode),
                "nama_produk": str(info_dika.get('nama_produk', item['nama_produk'])),
                "kategori": str(info_dika.get('kategori_produk', '')),
                "modal_unit": int(item['modal_unit']),
                "profit_unit": int(item['profit_unit']),
                "max_demand": int(item['max_demand']),
                "unit_baseline": unit_base,
                "modal_baseline": modal_base,
                "profit_baseline": profit_base,
                "jumlah_beli": jumlah_beli,
                "subtotal_modal": int(item['subtotal_modal']),
                "subtotal_profit": int(item['subtotal_profit']),
                "selisih_profit": int(item['subtotal_profit']) - profit_base
            })

        total_profit_base = int(df_base['profit_base'].sum())
        total_modal_base = int(df_base['modal_base'].sum())
        total_profit_ga = int(hasil_ga['total_profit_optimal'])
        kenaikan_profit = total_profit_ga - total_profit_base
        kenaikan_persen = round((kenaikan_profit / total_profit_base) * 100, 2) if total_profit_base > 0 else 0

        convergence_data = [
            {"generasi": int(row['generasi']), "fitness": int(row['best_profit'])}
            for row in hasil_ga['kurva_konvergensi']
        ]

        return jsonify({
            "kpi": {
                "total_profit": total_profit_ga,
                "modal_terpakai": int(hasil_ga['modal_terpakai']),
                "sisa_modal": int(hasil_ga['sisa_modal']),
                "total_unit": total_unit_ga,
                "roi_persen": float(hasil_ga['roi_persen'])
            },
            "comparison": {
                "baseline_profit": total_profit_base,
                "ga_profit": total_profit_ga,
                "kenaikan_profit": kenaikan_profit,
                "kenaikan_persen": kenaikan_persen,
                "baseline_modal": total_modal_base,
                "ga_modal": int(hasil_ga['modal_terpakai']),
                "baseline_unit": int(df_base['unit_base'].sum()),
                "ga_unit": total_unit_ga
            },
            "convergence": convergence_data,
            "recommendations": rekomendasi_list
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)