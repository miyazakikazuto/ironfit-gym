---
name: gym
description: Use when working on Gym's website (index.html), kasir frontend (kasir.html), or Google Apps Script backend (kasir.gs). Covers HTML/CSS/JS edits, GAS deployment, Google Sheets schema, and WhatsApp integration.
---

# Gym Kasir — IronFit Gym

Landing page dan aplikasi kasir untuk **IronFit Gym**, Jakarta Pusat.

## Project structure

```
├── index.html         Landing page + pendaftaran member via WhatsApp
├── kasir.html         Aplikasi kasir (PIN gate, catat pembayaran, riwayat)
├── kasir.gs           Google Apps Script backend (doPost/doGet ke Spreadsheet)
├── AGENTS.md          Dokumentasi proyek & arsitektur
├── meridian/          Proyek terpisah (Solana DeFi) — jangan dicampur
└── .opencode/
    ├── agents/
    │   └── gym.md     Subagent khusus Gym (via @gym)
    └── skills/
        └── gym/SKILL.md  File ini
```

## index.html — Landing page

- Single-page app, bottom nav: Beranda, Daftar, Trainer, Harga, Kontak
- Tab switching via `switchTab(tab)` — `#tab-{name}` sections + `[data-tab]` buttons
- Daftar form → WhatsApp (`wa.me/6285842851310`)
- Harga: Harian Rp12.000, Mingguan Rp45.000, Bulanan Rp120.000
- Jam operasional: 07.00 - 21.00

## kasir.html — Cashier app

- PIN gate (`1234`) sebelum akses
- Fitur: catat pembayaran, cek status member via API, filter riwayat per tanggal
- Auto-nominal: Harian=12000, Mingguan=45000, Bulanan=120000
- Format tanggal DD/MM/YYYY dengan auto-slash
- API URL: `https://script.google.com/macros/s/AKfycbxaeOK9kC6VVZi8Fq9L0OlFs8C_A8B7_zpCxF0OvzT83r_r9MAHjUceTu937Q1L98d0/exec`

## kasir.gs — Google Apps Script

- Web App: `doPost` (JSON body) + `doGet` (query params)
- Token auth: `ironfit_kasir_2024`
- Actions: `add`, `delete`, `cekMember`
- 2 sheets: `Transaksi` (Waktu, Nama, Paket, Nominal, Metode, Tanggal, Catatan, ID) dan `Member` (Nama, WA, Paket, TglMulai, TglExpired, Status)
- `updateMember()`: auto-perpanjang jika member sudah ada
- Spreadsheet ID: `1-PRK7z6G_Tb_GBgknG__iG7hLJ0YjGbqfZ-UzZM5xZg`

## Konstanta penting (JANGAN UBAH tanpa instruksi eksplisit)

| Konstanta | Nilai |
|-----------|-------|
| WA_NUMBER | `6285842851310` |
| TOKEN | `ironfit_kasir_2024` |
| PIN | `1234` |
| SPREADSHEET_ID | `1-PRK7z6G_Tb_GBgknG__iG7hLJ0YjGbqfZ-UzZM5xZg` |

## Aturan

1. Jangan ubah TOKEN, SPREADSHEET_ID, PIN, atau WA_NUMBER tanpa instruksi eksplisit
2. Jika menambah field di sheet, sesuaikan sheet header DAN kode GAS
3. Deploy ulang Web App setiap kali `kasir.gs` diubah
4. Jangan edit file di `meridian/` — itu proyek terpisah
