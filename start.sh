#!/bin/sh
# Start background worker for WhatsApp Auto Report
echo "Starting WhatsApp Auto Report Worker..."
node scripts/wa_auto_report.js > public/wa_log.txt 2>&1 &

# Start the main Next.js application
echo "Starting Next.js Server..."
exec node server.js
