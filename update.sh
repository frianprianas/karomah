#!/bin/bash

# Exit on any error
set -e

# Script untuk update aplikasi Karomah di server Ubuntu secara paksa & bersih
echo "--- MEMULAI UPDATE APLIKASI KAROMAH (PRODUKSI) ---"

# 0. Pastikan kepemilikan file benar (Perbaikan izin)
echo "Memperbaiki izin folder..."
sudo chown -R $USER:$USER .

# 1. Tarik kode terbaru dan paksa sinkron dengan GitHub/GitLab
echo "Sedang menyelaraskan kode dengan remote..."
git fetch --all
git reset --hard origin/main

# 2. Build ulang dan jalankan container
echo "Sedang membangun ulang container (Fresh Build)..."
# Gunakan sudo jika user belum masuk grup docker, tapi pastikan NOPASSWD aktif
sudo docker compose down
sudo docker system prune -f
sudo docker compose up -d --build

# 3. Verifikasi status container
echo "Memeriksa status layanan..."
sudo docker compose ps

echo "--- UPDATE SELESAI! ---"
echo "Aplikasi sekarang berjalan di: https://karomah.smkbn666.sch.id"
