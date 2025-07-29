#!/bin/bash

# Service Role Key로 Supabase API 직접 호출
curl -X POST 'https://ewkfmzqvflbmdiwojnse.supabase.co/rest/v1/users' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3a2ZtenF2ZmxibWRpd29qbnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxODczNiwiZXhwIjoyMDYyODk0NzM2fQ.p4ZOhm9bwEObj7r3t0C5U2DLdqsBq1uyY-YxkUFwxYI" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3a2ZtenF2ZmxibWRpd29qbnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxODczNiwiZXhwIjoyMDYyODk0NzM2fQ.p4ZOhm9bwEObj7r3t0C5U2DLdqsBq1uyY-YxkUFwxYI" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=representation" \
  -d '{
    "email": "test@algocarelab.com",
    "password_hash": "$2b$10$G5P8u8AufOGydu.h4YFXVefyIJ9XnswsOdjQSOtvicwFy6dBycxf2",
    "role": "admin",
    "is_active": true
  }'