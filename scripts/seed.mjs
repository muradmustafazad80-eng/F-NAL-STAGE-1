import './load-env.mjs'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const services = [
  ['Klassik saç kəsimi', 25, 30, 'Hair', 'yuma + styling'],
  ['Saç + saqqal', 40, 50, 'Hair', 'ən populyar'],
  ['Saqqal formalaşdırma', 20, 25, 'Beard', 'isti dəsmal daxil'],
  ['Royal ülgüc təraş', 30, 30, 'Beard', 'ənənəvi ritual'],
  ['Uşaq kəsimi', 18, 30, 'Hair', '12 yaşa qədər'],
  ['KRAL VIP Paket', 75, 75, 'VIP', 'Premium saç kəsimi|Saqqal formalaşdırma + ülgüc|Üz maskası və qulluq|Saç yuma & massaj|Pulsuz içki və qəlyan'],
]
const barbers = [
  ['Elvin Məmmədov', 'Baş Usta / Kurucu', '12 il təcrübə', '/images/barber-1.png'],
  ['Rəşad Quliyev', 'Fade & Modern Kəsim Ustası', '7 il təcrübə', '/images/barber-2.png'],
  ['Kamran Əliyev', 'Klassik Ülgüc & Saqqal Ustası', '15 il təcrübə', '/images/barber-3.png'],
]
const settings = [
  ['brand_name', 'KRAL BARBER'],
  ['address', 'Nizami küç. 45, Bakı, Azərbaycan'],
  ['phone', '+994 50 123 45 67'],
  ['phone_secondary', '+994 12 345 67 89'],
  ['working_hours', 'B.e – Şənbə: 10:00 – 22:00; Bazar: 11:00 – 20:00'],
  ['email', 'salam@kralbarber.az'],
  ['email_reservation', 'rezerv@kralbarber.az'],
  ['instagram_url', '#'],
  ['facebook_url', '#'],
  ['map_url', 'https://www.openstreetmap.org/export/embed.html?bbox=49.83%2C40.36%2C49.87%2C40.39&layer=mapnik'],
]
const reviews = [
  ['Tural H.', '994501000001', 'Elvin Məmmədov', 5, 'Şəhərdə ən yaxşı barbershop. Elvin usta işini mükəmməl bilir, hər dəfə tam istədiyim görünüşü alıram.'],
  ['Nicat A.', '994501000002', 'Rəşad Quliyev', 5, 'VIP paketi aldım — ülgüc təraş və üz maskası inanılmaz idi. Atmosfer həqiqətən premium.'],
  ['Orxan M.', '994501000003', 'Kamran Əliyev', 5, 'Saqqal formalaşdırma üçün gəlirəm. Detallara diqqət və peşəkarlıq başqa səviyyədədir.'],
  ['Səməd V.', '994501000004', 'Elvin Məmmədov', 5, 'Rezervasiya sistemi çox rahatdır, gözləmə yoxdur. Qiymət-keyfiyyət balansı əladır.'],
]

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const [name, price, duration, category, description] of services) {
      await client.query(`INSERT INTO "Service" (name, price, duration, category, description) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (name) DO UPDATE SET price=EXCLUDED.price, duration=EXCLUDED.duration, category=EXCLUDED.category, description=EXCLUDED.description`, [name, price, duration, category, description])
    }
    for (const [name, specialty, experience, image] of barbers) {
      await client.query(`INSERT INTO "Barber" (name, specialty, experience, image) VALUES ($1,$2,$3,$4) ON CONFLICT (name) DO UPDATE SET specialty=EXCLUDED.specialty, experience=EXCLUDED.experience, image=EXCLUDED.image, status='active'`, [name, specialty, experience, image])
    }
    for (const [key, value] of settings) {
      await client.query(`INSERT INTO "BusinessSetting" (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [key, value])
    }
    for (const [customerName, phone, barberName, rating, comment] of reviews) {
      const customer = await client.query(`INSERT INTO "Customer" (name, phone) VALUES ($1,$2) ON CONFLICT (phone) DO UPDATE SET name=EXCLUDED.name RETURNING id`, [customerName, phone])
      const barber = await client.query(`SELECT id FROM "Barber" WHERE name=$1`, [barberName])
      await client.query(`INSERT INTO "Review" (customerId, barberId, rating, comment) SELECT $1,$2,$3,$4 WHERE NOT EXISTS (SELECT 1 FROM "Review" WHERE comment=$4)`, [customer.rows[0].id, barber.rows[0].id, rating, comment])
    }
    await client.query('COMMIT')
    console.log('Stage 1 seed data hazırdır (mövcud biznes məlumatları silinməyib).')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
