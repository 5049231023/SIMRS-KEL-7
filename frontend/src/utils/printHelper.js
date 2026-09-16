export function openPrintWindow({ title, htmlContent }) {
  const printWindow = window.open('', '_blank', 'width=900,height=800,menubar=no,toolbar=no,location=no,status=no');
  if (!printWindow) {
    alert('Jendela cetak terblokir oleh browser. Harap izinkan pop-up untuk situs ini agar dapat mencetak.');
    return;
  }

  const documentHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title || 'Cetak Dokumen Medis SIMRS'}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    body {
      background: #ffffff;
      color: #0f172a;
      padding: 30px 40px;
      font-size: 13px;
      line-height: 1.5;
    }
    .print-header-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px dashed #cbd5e1;
    }
    .btn-print-now {
      background: #1e40af;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-print-now:hover {
      background: #1d4ed8;
    }
    .btn-close-win {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-close-win:hover {
      background: #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 12px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #1e293b;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print, .print-header-actions {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-header-actions no-print">
    <button class="btn-print-now" onclick="window.print()">Cetak Dokumen Sekarang (Ctrl+P)</button>
    <button class="btn-close-win" onclick="window.close()">Tutup Halaman Ini</button>
  </div>
  <div class="printable-body">
    ${htmlContent}
  </div>
  <script>
    window.onload = function() {
      window.focus();
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(documentHtml);
  printWindow.document.close();
}