// kasir.gs — Google Apps Script untuk IronFit Kasir
// Cara pakai:
// 1. Buat Google Spreadsheet, buat 2 sheet:
//    "Transaksi" (header: Waktu | Nama | Paket | Nominal | Metode | Tanggal | Catatan | ID)
//    "Member"   (header: Nama | WA | Paket | TglMulai | TglExpired | Status)
// 2. Extensions > Apps Script, paste kode ini, ganti TOKEN jika perlu.
// 3. Deploy > New deployment > type Web app,
//    Execute as: Me, Who has access: Anyone.
// 4. Copy URL web app ke konstanta API di kasir.html (dan TOKEN harus sama).

const TOKEN = 'ironfit_kasir_2024';
const SPREADSHEET_ID = '1-PRK7z6G_Tb_GBgknG__iG7hLJ0YjGbqfZ-UzZM5xZg';
const DURASI = { Harian: 1, Mingguan: 7, Bulanan: 30 };

function getSheetMember() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Member');
  if (!sheet) {
    sheet = ss.insertSheet('Member');
    sheet.appendRow(['Nama', 'WA', 'Paket', 'TglMulai', 'TglExpired', 'Status']);
  }
  return sheet;
}

function updateMember(nama, wa, paket) {
  const ms = getSheetMember();
  const md = ms.getDataRange().getValues();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = DURASI[paket] || 1;
  let row = -1;

  for (let i = 1; i < md.length; i++) {
    if (String(md[i][0]).toLowerCase() === nama.toLowerCase().trim()) {
      row = i;
      break;
    }
  }

  if (row === -1) {
    const expired = new Date(today);
    expired.setDate(expired.getDate() + days);
    ms.appendRow([nama.trim(), wa || '', paket, today, expired, 'Aktif']);
  } else {
    const currentExpired = md[row][4];
    let start;
    if (currentExpired && new Date(currentExpired) >= today) {
      start = new Date(currentExpired);
    } else {
      start = new Date(today);
    }
    const expired = new Date(start);
    expired.setDate(expired.getDate() + days);
    const cellWA = wa || md[row][1];
    const status = expired >= today ? 'Aktif' : 'Expired';
    ms.getRange(row + 1, 1, 1, 6).setValues([[nama.trim(), cellWA, paket, today, expired, status]]);
  }
}

function isoDate(v) {
  if (!v) return '';
  if (typeof v === 'object' && v instanceof Date) return v.toISOString();
  if (typeof v === 'number') return new Date((v - 25569) * 86400 * 1000).toISOString();
  return String(v);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.token !== TOKEN) return json({ error: 'unauthorized' });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Transaksi');
    if (!sheet) return json({ error: 'sheet Transaksi tidak ditemukan' });

    sheet.appendRow([
      new Date(),
      data.nama || '',
      data.paket || '',
      Number(data.nominal) || 0,
      data.metode || '',
      data.tanggal || '',
      data.catatan || '',
      String(Date.now())
    ]);
    sheet.getRange(sheet.getLastRow(), 6).setNumberFormat('@').setValue(data.tanggal || '');
    updateMember(data.nama || '', data.nowa || '', data.paket || '');
    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function doGet(e) {
  try {
    if (e.parameter.token !== TOKEN) return json({ error: 'unauthorized' });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Transaksi');
    if (!sheet) return json({ error: 'sheet Transaksi tidak ditemukan' });

    if (e.parameter.action === 'add') {
      sheet.appendRow([
        new Date(),
        e.parameter.nama || '',
        e.parameter.paket || '',
        Number(e.parameter.nominal) || 0,
        e.parameter.metode || '',
        e.parameter.tanggal || '',
        e.parameter.catatan || '',
        String(Date.now())
      ]);
      sheet.getRange(sheet.getLastRow(), 6).setNumberFormat('@').setValue(e.parameter.tanggal || '');
      updateMember(e.parameter.nama || '', e.parameter.nowa || '', e.parameter.paket || '');
      return json({ ok: true });
    }

    if (e.parameter.action === 'delete') {
      const id = e.parameter.id || '';
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][7]) === id) {
          sheet.deleteRow(i + 1);
          return json({ ok: true });
        }
      }
      return json({ error: 'not found' });
    }

    if (e.parameter.action === 'cekMember') {
      const cari = (e.parameter.nama || '').trim().toLowerCase();
      if (!cari) return json({ ada: false, error: 'nama kosong' });
      const ms = getSheetMember();
      const md = ms.getDataRange().getValues();
      for (let i = 1; i < md.length; i++) {
        if (String(md[i][0]).toLowerCase() === cari) {
          const expired = md[i][4];
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const status = expired && new Date(expired) >= today ? 'Aktif' : 'Expired';
          return json({
            ada: true, nama: md[i][0], wa: md[i][1], paket: md[i][2],
            tglMulai: isoDate(md[i][3]),
            tglExpired: isoDate(expired),
            status: status
          });
        }
      }
      return json({ ada: false });
    }

    const last = sheet.getLastRow();
    const limit = 1000;
    const start = Math.max(2, last - limit + 1);
    const rows = last < 2 ? [] : sheet.getRange(start, 1, last - start + 1, 8).getValues();

    const out = rows.map(r => ({
      waktu: r[0], nama: r[1], paket: r[2], nominal: r[3],
      metode: r[4], tanggal: r[5], catatan: r[6], id: r[7] ? String(r[7]) : ''
    }));
    return json({ rows: out });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
