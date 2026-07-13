// kasir.gs — Google Apps Script untuk IronFit Kasir
// Cara pakai:
// 1. Buat Google Spreadsheet baru, buat sheet bernama "Transaksi" (baris 1 = header:
//    Waktu | Nama | Paket | Nominal | Metode | Tanggal | Catatan | ID)
// 2. Extensions > Apps Script, paste kode ini, ganti TOKEN jika perlu.
// 3. Deploy > New deployment > type Web app,
//    Execute as: Me, Who has access: Anyone.
// 4. Copy URL web app ke konstanta API di kasir.html (dan TOKEN harus sama).

const TOKEN = 'ironfit_kasir_2024';
const SPREADSHEET_ID = '1-PRK7z6G_Tb_GBgknG__iG7hLJ0YjGbqfZ-UzZM5xZg';

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
