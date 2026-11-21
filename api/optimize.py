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


def hitung_baseline(df_dika, batas_modal=2000000):
    df = df_dika.drop_duplicates(subset=["kode_produk"]).copy()
    sisa_modal = batas_modal
    unit_base, modal_base, profit_base = [], [], []

    for _, row in df.iterrows():
        modal_u = int(row["modal_unit"])
        profit_u = int(row["profit_unit"])
        max_dem = int(row["max_demand"])

        beli = min(max_dem, int(sisa_modal // modal_u)) if modal_u > 0 else 0
        unit_base.append(beli)
        modal_base.append(beli * modal_u)
        profit_base.append(beli * profit_u)
        sisa_modal -= beli * modal_u

    df["unit_base"] = unit_base
    df["modal_base"] = modal_base
    df["profit_base"] = profit_base
    return df


@app.route("/api/baseline", methods=["GET"])
def get_baseline():
    modal_awal = max(10000, int(request.args.get("modal") or 2000000))
    df_dika = pd.read_csv("data_dashboard_dika.csv")
    df_base = hitung_baseline(df_dika, batas_modal=modal_awal)

    profil_produk = []
    for _, row in df_base.iterrows():
        profil_produk.append({
            "kode_produk": str(row["kode_produk"]),
            "nama_produk": str(row["nama_produk"]),
            "kategori": str(row.get("kategori_produk", "Umum")),
            "modal_unit": int(row["modal_unit"]),
            "profit_unit": int(row["profit_unit"]),
            "max_demand": int(row["max_demand"]),
            "unit_baseline": int(row["unit_base"]),
            "modal_baseline": int(row["modal_base"]),
            "profit_baseline": int(row["profit_base"]),
        })

    total_modal_base = int(df_base["modal_base"].sum())
    total_profit_base = int(df_base["profit_base"].sum())

    return jsonify({
        "summary": {
            "total_produk": len(df_base),
            "total_unit_baseline": int(df_base["unit_base"].sum()),
            "total_modal_baseline": total_modal_base,
            "total_profit_baseline": total_profit_base,
            "roi_baseline": (
                round((total_profit_base / total_modal_base) * 100, 2)
                if total_modal_base > 0
                else 0
            ),
        },
        "products": profil_produk,
    })


@app.route("/api/optimize", methods=["POST"])
@app.route("/", methods=["POST"])
def optimize():
    try:
        data_input = request.json or {}
        total_modal = max(10000, int(data_input.get("modal") or 2000000))
        generasi = max(10, int(data_input.get("generasi") or 300))
        populasi = max(10, int(data_input.get("populasi") or 100))

        df_dika = pd.read_csv("data_dashboard_dika.csv")
        df_base = hitung_baseline(df_dika, batas_modal=total_modal)
        base_map = df_base.set_index("kode_produk").to_dict(orient="index")

        hasil_ga = jalankan_ga(
            df=df_harya,
            batas_modal=total_modal,
            pop_size=populasi,
            generations=generasi,
            crossover_rate=0.8,
            mutation_rate=0.1,
            seed=42,
        )

        rekomendasi_list = []
        total_unit_ga = 0
        total_modal_ga = 0
        total_profit_ga = 0

        for item in hasil_ga["tabel_rekomendasi"]:
            kode = item["kode_produk"]
            max_dem = int(item["max_demand"])
            modal_u = int(item["modal_unit"])
            profit_u = int(item["profit_unit"])

            # Terapkan batas keras qty <= max_demand & guard None
            jumlah_beli = min(
                int(item.get("jumlah_produksi_optimal") or 0), max_dem
            )
            sub_modal = jumlah_beli * modal_u
            sub_profit = jumlah_beli * profit_u

            total_unit_ga += jumlah_beli
            total_modal_ga += sub_modal
            total_profit_ga += sub_profit

            info_dika = base_map.get(kode, {})
            unit_base = int(info_dika.get("unit_base", 0))
            profit_base = int(info_dika.get("profit_base", 0))
            modal_base = int(info_dika.get("modal_base", 0))

            rekomendasi_list.append({
                "kode_produk": str(kode),
                "nama_produk": str(
                    info_dika.get("nama_produk", item["nama_produk"])
                ),
                "kategori": str(info_dika.get("kategori_produk", "")),
                "modal_unit": modal_u,
                "profit_unit": profit_u,
                "max_demand": max_dem,
                "unit_baseline": unit_base,
                "modal_baseline": modal_base,
                "profit_baseline": profit_base,
                "jumlah_beli": jumlah_beli,
                "subtotal_modal": sub_modal,
                "subtotal_profit": sub_profit,
                "selisih_profit": sub_profit - profit_base,
            })

        total_profit_base = int(df_base["profit_base"].sum())
        total_modal_base = int(df_base["modal_base"].sum())
        kenaikan_profit = total_profit_ga - total_profit_base
        kenaikan_persen = (
            round((kenaikan_profit / total_profit_base) * 100, 2)
            if total_profit_base > 0
            else 0
        )
        roi_ga = (
            round((total_profit_ga / total_modal_ga) * 100, 2)
            if total_modal_ga > 0
            else 0
        )

        convergence_data = [
            {
                "generasi": int(row["generasi"]),
                "fitness": int(row["best_profit"]),
            }
            for row in hasil_ga["kurva_konvergensi"]
        ]

        return jsonify({
            "kpi": {
                "total_profit": total_profit_ga,
                "modal_terpakai": total_modal_ga,
                "sisa_modal": max(0, total_modal - total_modal_ga),
                "total_unit": total_unit_ga,
                "roi_persen": roi_ga,
            },
            "comparison": {
                "baseline_profit": total_profit_base,
                "ga_profit": total_profit_ga,
                "kenaikan_profit": kenaikan_profit,
                "kenaikan_persen": kenaikan_persen,
                "baseline_modal": total_modal_base,
                "ga_modal": total_modal_ga,
                "baseline_unit": int(df_base["unit_base"].sum()),
                "ga_unit": total_unit_ga,
            },
            "convergence": convergence_data,
            "recommendations": rekomendasi_list,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000)