#!/bin/sh
mkdir -p /app/data
npx prisma generate
npx prisma db push
exec npm run dev
