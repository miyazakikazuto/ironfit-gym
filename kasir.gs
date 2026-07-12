// kasir.gs — Google Apps Script untuk IronFit Kasir
// Cara pakai:
// 1. Buat Google Spreadsheet baru, buat sheet bernama "Transaksi" (baris 1 = header:
//    Waktu | Nama | Paket | Nominal | Metode | Tanggal | Catatan)
// 2. Extensions > Apps Script, paste kode ini, ganti TOKEN jika perlu.
// 3. Deploy > New deployment > type Web app,
//    Execute as: Me, Who has access: Anyone.
// 4. Copy URL web app ke konstanta API di kasir.html (dan TOKEN harus sama).

const TOKEN = 'ironfit_kasir_2024';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.token !== TOKEN) return json({ error: 'unauthorized' });

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transaksi');
    if (!sheet) return json({ error: 'sheet Transaksi tidak ditemukan' });

    sheet.appendRow([
      new Date(),
      data.nama || '',
      data.paket || '',
      data.nominal || '',
      data.metode || '',
      data.tanggal || '',
      data.catatan || ''
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function doGet(e) {
  if (e.parameter.token !== TOKEN) return json({ error: 'unauthorized' });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transaksi');
  const last = sheet.getLastRow();
  const limit = 200;
  const start = Math.max(2, last - limit + 1);
  const rows = last < 2 ? [] : sheet.getRange(start, 1, last - start + 1, 7).getValues();

  const out = rows.map(r => ({
    waktu: r[0],
    nama: r[1],
    paket: r[2],
    nominal: r[3],
    metode: r[4],
    tanggal: r[5],
    catatan: r[6]
  }));
  return json({ rows: out });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
