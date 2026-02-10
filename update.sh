#!/bin/bash

# Script untuk update aplikasi Karomah di server Ubuntu
echo "--- MEMULAI UPDATE APLIKASI KAROMAH ---"

# 1. Tarik kode terbaru dari GitHub
echo "Sedang mengambil kode terbaru..."
git pull origin main

# 2. Build ulang dan jalankan container
echo "Sedang membangun ulang container (ini mungkin memakan waktu)..."
sudo docker compose up -d --build

# 3. Bersihkan image lama yang tidak terpakai (hemat disk)
echo "Membersihkan sisa-sisa build lama..."
sudo docker system prune -f

echo "--- UPDATE SELESAI! Aplikasi sudah berjalan di versi terbaru ---"
