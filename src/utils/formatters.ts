import { TimePeriod, Transaction, TopUp, Student, AppSettings } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num || 0);
};

export const getTimePeriod = (dateInput?: Date | string): TimePeriod => {
  const date = dateInput ? new Date(dateInput) : new Date();
  const hours = date.getHours();

  if (hours >= 5 && hours < 11) {
    return 'pagi';
  } else if (hours >= 11 && hours < 15) {
    return 'siang';
  } else if (hours >= 15 && hours < 18) {
    return 'sore';
  } else {
    return 'malam';
  }
};

export const getTimePeriodLabel = (period: TimePeriod): { label: string; badgeClass: string; icon: string } => {
  switch (period) {
    case 'pagi':
      return { label: 'Pagi (05:00 - 10:59)', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300', icon: '🌅' };
    case 'siang':
      return { label: 'Siang (11:00 - 14:59)', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300', icon: '☀️' };
    case 'sore':
      return { label: 'Sore (15:00 - 17:59)', badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300', icon: '🌆' };
    case 'malam':
      return { label: 'Malam (18:00 - 04:59)', badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300', icon: '🌙' };
  }
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatTimeOnly = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const generateNIS = (): string => {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SNT-${year}${random}`;
};

export const generateCode = (prefix: 'TRX' | 'TOP'): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomHex}`;
};

// WhatsApp Link Generator
export const getWhatsAppLink = (phone: string, message: string): string => {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

// PDF Generator for Reports
export const exportReportToPDF = (
  title: string,
  periodSubtitle: string,
  settings: AppSettings,
  students: Student[],
  transactions: Transaction[],
  topups: TopUp[],
  targetStudent?: Student
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header / Kop Surat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(16, 122, 68); // Pondok Green
  doc.text(settings.pesantren_name.toUpperCase(), pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(settings.koperasi_name, pageWidth / 2, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(settings.address + ' | Telp: ' + settings.phone, pageWidth / 2, 27, { align: 'center' });

  // Double Line Separator
  doc.setDrawColor(16, 122, 68);
  doc.setLineWidth(0.8);
  doc.line(14, 30, pageWidth - 14, 30);
  doc.setLineWidth(0.2);
  doc.line(14, 31, pageWidth - 14, 31);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(title, pageWidth / 2, 40, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(periodSubtitle, pageWidth / 2, 45, { align: 'center' });

  let startY = 52;

  // Single Student Specific Details if provided
  if (targetStudent) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, startY, pageWidth - 28, 28, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Nama Santri: ${targetStudent.name}`, 18, startY + 7);
    doc.text(`NIS: ${targetStudent.nis}`, 18, startY + 14);
    doc.text(`Kelas / Asrama: ${targetStudent.class_name} / ${targetStudent.dormitory}`, 18, startY + 21);

    const studentTopupsSum = topups
      .filter((t) => t.student_id === targetStudent.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const studentExpensesSum = transactions
      .filter((t) => t.student_id === targetStudent.id)
      .reduce((sum, t) => sum + t.amount, 0);

    doc.text(`Total Top Up: ${formatRupiah(studentTopupsSum)}`, 110, startY + 7);
    doc.text(`Total Jajan: ${formatRupiah(studentExpensesSum)}`, 110, startY + 14);
    doc.text(`Saldo Akhir: ${formatRupiah(targetStudent.balance)}`, 110, startY + 21);

    startY += 34;
  }

  // Combine & sort all history records (TopUps & Jajan)
  const combinedRecords = [
    ...topups.map((t) => ({
      date: t.created_at,
      code: t.topup_code,
      type: 'Isi Saldo (Top Up)',
      student: t.student_name || 'Santri',
      category: 'Top Up',
      notes: t.notes || 'Isi saldo tunai/transfer',
      inAmount: t.amount,
      outAmount: 0,
    })),
    ...transactions.map((tr) => ({
      date: tr.created_at,
      code: tr.transaction_code,
      type: 'Jajan Koperasi',
      student: tr.student_name || 'Santri',
      category: tr.category,
      notes: tr.notes || tr.category,
      inAmount: 0,
      outAmount: tr.amount,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tableRows = combinedRecords.map((item, idx) => [
    idx + 1,
    formatDateTime(item.date),
    item.code,
    item.student,
    item.category,
    item.inAmount > 0 ? formatRupiah(item.inAmount) : '-',
    item.outAmount > 0 ? formatRupiah(item.outAmount) : '-',
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['#', 'Waktu', 'Kode', 'Santri', 'Kategori', 'Masuk (TopUp)', 'Keluar (Jajan)']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 122, 68], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
      5: { cellWidth: 26, halign: 'right' },
      6: { cellWidth: 26, halign: 'right' },
    },
  });

  // Summary totals box
  const totalTopUpAll = combinedRecords.reduce((acc, curr) => acc + curr.inAmount, 0);
  const totalExpenseAll = combinedRecords.reduce((acc, curr) => acc + curr.outAmount, 0);

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  if (finalY < doc.internal.pageSize.getHeight() - 50) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, finalY, pageWidth - 28, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`TOTAL PEMASUKAN (TOP UP): ${formatRupiah(totalTopUpAll)}`, 18, finalY + 10);
    doc.text(`TOTAL PENGELUARAN (JAJAN): ${formatRupiah(totalExpenseAll)}`, 110, finalY + 10);

    // Signatures
    const sigY = finalY + 24;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Kota Pesantren, ${formatDate(new Date().toISOString())}`, pageWidth - 60, sigY);
    doc.text('Pengurus Koperasi,', pageWidth - 60, sigY + 5);

    // Digital Signature box
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(pageWidth - 60, sigY + 8, 40, 15, 1, 1);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('[ TANDA TANGAN DIGITAL ]', pageWidth - 58, sigY + 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(settings.treasurer_name || 'Bendahara Koperasi', pageWidth - 60, sigY + 28);
  }

  // Save PDF
  const cleanTitle = title.toLowerCase().replace(/\s+/g, '_');
  doc.save(`${cleanTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Excel & CSV Export Generator
export const exportToExcelOrCSV = (
  filename: string,
  transactions: Transaction[],
  topups: TopUp[],
  format: 'xlsx' | 'csv'
) => {
  const combined = [
    ...topups.map((t) => ({
      'TANGGAL & WAKTU': formatDateTime(t.created_at),
      'KODE TRANSAKSI': t.topup_code,
      'JENIS TRANSAKSI': 'Isi Saldo (Top Up)',
      SANTRI: t.student_name || '-',
      KATEGORI: 'Top Up',
      'NOMINAL MASUK (IDR)': t.amount,
      'NOMINAL KELUAR (IDR)': 0,
      METODE: t.payment_method,
      CATATAN: t.notes || '-',
    })),
    ...transactions.map((tr) => ({
      'TANGGAL & WAKTU': formatDateTime(tr.created_at),
      'KODE TRANSAKSI': tr.transaction_code,
      'JENIS TRANSAKSI': 'Jajan Koperasi',
      SANTRI: tr.student_name || '-',
      KATEGORI: tr.category,
      'NOMINAL MASUK (IDR)': 0,
      'NOMINAL KELUAR (IDR)': tr.amount,
      METODE: 'Saldo Santri',
      CATATAN: tr.notes || tr.category,
    })),
  ].sort((a, b) => new Date(b['TANGGAL & WAKTU']).getTime() - new Date(a['TANGGAL & WAKTU']).getTime());

  const worksheet = XLSX.utils.json_to_sheet(combined);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Koperasi');

  if (format === 'csv') {
    XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx' });
  }
};
