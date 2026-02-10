#!/bin/bash

# Script untuk update aplikasi Karomah di server Ubuntu secara paksa & bersih
echo "--- MEMULAI UPDATE APLIKASI KAROMAH (PRODUKSI) ---"

# 1. Tarik kode terbaru dan paksa sinkron dengan GitHub
echo "Sedang menyelaraskan kode dengan GitHub..."
git fetch --all
git reset --hard origin/main

# 2. Build ulang dan jalankan container tanpa menggunakan cache lama
echo "Sedang membangun ulang container (Fresh Build)..."
# Menggunakan 'docker compose' (Docker V2) sesuai spesifikasi server
sudo docker compose down
sudo docker system prune -af
sudo docker compose up -d --build

# 3. Verifikasi status container
echo "Memeriksa status layanan..."
sudo docker compose ps

echo "--- UPDATE SELESAI! ---"
echo "Aplikasi sekarang berjalan di: https://karomah.smkbn666.sch.id"
