import json
import numpy as np
import pandas as pd

# 1. Load dataset bersih khusus Algorithm Lead
df_produk = pd.read_csv("data_produk_siap_harya.csv")


def jalankan_ga(
    df,
    batas_modal=2000000,
    pop_size=100,
    generations=300,
    crossover_rate=0.8,
    mutation_rate=0.1,
    seed=42,
):
    np.random.seed(seed)
    n_produk = len(df)
    modal_unit = df["modal_unit"].values
    profit_unit = df["profit_unit"].values
    max_demand = df["max_demand"].values

    # Inisialisasi populasi awal (jumlah produksi acak antara 0 s.d. max_demand)
    populasi = np.array(
        [np.random.randint(0, max_demand + 1) for _ in range(pop_size)]
    )

    def evaluasi_fitness(pop):
        total_modal = pop @ modal_unit
        total_profit = pop @ profit_unit
        kelebihan_modal = np.maximum(0, total_modal - batas_modal)
        # Penalti tegas jika melebihi batas modal
        fitness = np.where(
            kelebihan_modal == 0,
            total_profit,
            total_profit - (2.0 * kelebihan_modal),
        )
        return fitness, total_modal, total_profit

    riwayat_konvergensi = []
    solusi_terbaik = None
    profit_terbaik = -np.inf
    modal_terbaik = 0

    for gen in range(generations):
        fitness, total_modal, total_profit = evaluasi_fitness(populasi)

        # Catat individu terbaik yang memenuhi batas modal
        valid_mask = total_modal <= batas_modal
        if np.any(valid_mask):
            valid_profits = np.where(valid_mask, total_profit, -np.inf)
            idx_terbaik = np.argmax(valid_profits)
            if valid_profits[idx_terbaik] > profit_terbaik:
                profit_terbaik = int(valid_profits[idx_terbaik])
                modal_terbaik = int(total_modal[idx_terbaik])
                solusi_terbaik = populasi[idx_terbaik].copy()

        riwayat_konvergensi.append({
            "generasi": gen + 1,
            "best_profit": int(profit_terbaik) if profit_terbaik > -np.inf else 0,
            "avg_fitness": float(np.mean(fitness)),
        })

        # Elitism: pertahankan 1 kromosom terbaik ke generasi berikutnya
        populasi_baru = []
        if solusi_terbaik is not None:
            populasi_baru.append(solusi_terbaik.copy())

        while len(populasi_baru) < pop_size:
            # Tournament Selection (k = 3)
            t1 = np.random.choice(pop_size, 3, replace=False)
            parent1 = populasi[t1[np.argmax(fitness[t1])]]

            t2 = np.random.choice(pop_size, 3, replace=False)
            parent2 = populasi[t2[np.argmax(fitness[t2])]]

            # Uniform Crossover
            if np.random.rand() < crossover_rate:
                mask = np.random.rand(n_produk) < 0.5
                child1 = np.where(mask, parent1, parent2)
                child2 = np.where(mask, parent2, parent1)
            else:
                child1, child2 = parent1.copy(), parent2.copy()

            # Mutasi (Kombinasi Random Reset & Step Perturbation)
            for child in (child1, child2):
                for i in range(n_produk):
                    if np.random.rand() < mutation_rate:
                        if np.random.rand() < 0.5:
                            child[i] = np.random.randint(0, max_demand[i] + 1)
                        else:
                            geser = np.random.randint(-20, 21)
                            child[i] = np.clip(child[i] + geser, 0, max_demand[i])
                populasi_baru.append(child)
                if len(populasi_baru) >= pop_size:
                    break

        populasi = np.array(populasi_baru)

    # Pengaman jika tidak ditemukan solusi valid (misal batas_modal terlalu kecil)
    if solusi_terbaik is None:
        solusi_terbaik = np.zeros(n_produk, dtype=int)
        profit_terbaik = 0
        modal_terbaik = 0

    # Susun tabel rekomendasi produksi
    hasil_produk = df.copy()
    hasil_produk["jumlah_produksi_optimal"] = solusi_terbaik
    hasil_produk["subtotal_modal"] = (
        hasil_produk["jumlah_produksi_optimal"] * hasil_produk["modal_unit"]
    )
    hasil_produk["subtotal_profit"] = (
        hasil_produk["jumlah_produksi_optimal"] * hasil_produk["profit_unit"]
    )

    roi_persen = (
        round((profit_terbaik / modal_terbaik) * 100, 2)
        if modal_terbaik > 0
        else 0.0
    )

    return {
        "batas_modal": batas_modal,
        "modal_terpakai": modal_terbaik,
        "sisa_modal": batas_modal - modal_terbaik,
        "total_profit_optimal": profit_terbaik,
        "roi_persen": roi_persen,
        "tabel_rekomendasi": hasil_produk.to_dict(orient="records"),
        "kurva_konvergensi": riwayat_konvergensi,
    }


# ==============================================================================
# 3. UJI VARIASI PARAMETER (Untuk Laporan Bab IV & Analisis Performa)
# ==============================================================================
if __name__ == "__main__":
    MODAL_UJI = 2000000  # Skenario batas modal Rp 2.000.000

    skenario_parameter = [
        {
            "skenario": "Skenario 1 (Populasi Kecil)",
            "pop_size": 30,
            "generations": 150,
            "crossover_rate": 0.7,
            "mutation_rate": 0.05,
        },
        {
            "skenario": "Skenario 2 (Standar)",
            "pop_size": 50,
            "generations": 200,
            "crossover_rate": 0.8,
            "mutation_rate": 0.10,
        },
        {
            "skenario": "Skenario 3 (Populasi Besar)",
            "pop_size": 100,
            "generations": 300,
            "crossover_rate": 0.8,
            "mutation_rate": 0.10,
        },
        {
            "skenario": "Skenario 4 (Mutasi Tinggi)",
            "pop_size": 100,
            "generations": 300,
            "crossover_rate": 0.9,
            "mutation_rate": 0.20,
        },
    ]

    hasil_uji = []
    best_run = None

    for cfg in skenario_parameter:
        res = jalankan_ga(
            df_produk,
            batas_modal=MODAL_UJI,
            pop_size=cfg["pop_size"],
            generations=cfg["generations"],
            crossover_rate=cfg["crossover_rate"],
            mutation_rate=cfg["mutation_rate"],
        )
        hasil_uji.append({
            "Skenario": cfg["skenario"],
            "Pop_Size": cfg["pop_size"],
            "Generasi": cfg["generations"],
            "Crossover_Rate": cfg["crossover_rate"],
            "Mutation_Rate": cfg["mutation_rate"],
            "Modal_Terpakai": res["modal_terpakai"],
            "Total_Profit": res["total_profit_optimal"],
            "ROI (%)": res["roi_persen"],
        })
        if cfg["skenario"] == "Skenario 3 (Populasi Besar)":
            best_run = res

    df_uji = pd.DataFrame(hasil_uji)
    print("=== HASIL UJI VARIASI PARAMETER GA ===")
    print(df_uji.to_string(index=False))

    # Export output untuk kebutuhan Dashboard & Laporan Bab IV
    df_uji.to_csv("hasil_uji_parameter_ga.csv", index=False)
    with open("output_ga_dashboard.json", "w") as f:
        json.dump(best_run, f, indent=2)