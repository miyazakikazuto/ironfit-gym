# IronFit Gym

Landing page dan aplikasi kasir untuk **IronFit Gym** — gym di Jakarta Pusat.

## Fitur

- **Landing page** (\`index.html\`) — halaman profil gym dengan info harga, fasilitas, dan pendaftaran member via WhatsApp
- **Aplikasi Kasir** (\`kasir.html\`) — sistem kasir dengan PIN gate untuk mencatat pembayaran, cek status member, dan riwayat transaksi
- **Google Apps Script Backend** (\`kasir.gs\`) — web app backend untuk menyimpan transaksi dan data member ke Google Sheets

## Harga

| Paket | Harga |
|-------|-------|
| Harian | Rp12.000 |
| Mingguan | Rp45.000 |
| Bulanan | Rp120.000 (30 hari) |

## Teknologi

- HTML + CSS + JavaScript (vanilla)
- Google Apps Script
- Google Sheets
- WhatsApp API

## Cara Pakai

1. Deploy \`kasir.gs\` sebagai Google Apps Script web app
2. Set TOKEN dan SPREADSHEET_ID sesuai konfigurasi
3. Buka \`index.html\` untuk landing page
4. Buka \`kasir.html\` untuk mengakses kasir (PIN: 1234)