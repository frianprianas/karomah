#!/bin/sh
# Start background worker for WhatsApp Auto Report
# Using nohup to ensure it keeps running, sending output to stdout
echo "Starting WhatsApp Auto Report Worker..."
node scripts/wa_auto_report.js &

# Start the main Next.js application
echo "Starting Next.js Server..."
exec node server.js
