import React from 'react';
import { Modal } from './Modal';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { Printer, CheckCircle, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'jajan' | 'topup';
  receiptCode: string;
  studentName: string;
  studentNis: string;
  amount: number;
  categoryOrMethod: string;
  notes?: string;
  timePeriod?: string;
  dateStr?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  receiptCode,
  studentName,
  studentNis,
  amount,
  categoryOrMethod,
  notes,
  timePeriod,
  dateStr,
}) => {
  const { settings } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex flex-col items-center">
        {/* Printable Area */}
        <div
          id="receipt-printable-area"
          className="w-full max-w-sm bg-amber-50/40 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm font-mono text-slate-800 dark:text-slate-200 text-xs leading-relaxed"
        >
          {/* Koperasi Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 mb-1">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white uppercase">
              {settings.pesantren_name}
            </h4>
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {settings.koperasi_name}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{settings.address}</p>
          </div>

          {/* Receipt Info */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Struk:</span>
              <span className="font-bold">{receiptCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span>{formatDateTime(dateStr || new Date().toISOString())}</span>
            </div>
            {timePeriod && (
              <div className="flex justify-between">
                <span className="text-slate-500">Sesi Waktu:</span>
                <span className="uppercase font-semibold text-emerald-700 dark:text-emerald-400">
                  {timePeriod}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Jenis:</span>
              <span className="font-semibold">{type === 'jajan' ? 'TRANSAKSI JAJAN' : 'ISI SALDO (TOP UP)'}</span>
            </div>
          </div>

          {/* Student Info */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Santri:</span>
              <span className="font-bold text-slate-900 dark:text-white">{studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">NIS:</span>
              <span>{studentNis}</span>
            </div>
          </div>

          {/* Transaction Items */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-2">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm">
              <span>{categoryOrMethod}</span>
              <span>{formatRupiah(amount)}</span>
            </div>
            {notes && <p className="text-[11px] text-slate-500 italic">Catatan: {notes}</p>}
          </div>

          {/* Total */}
          <div className="pt-3 pb-2 flex justify-between items-center font-bold text-base text-emerald-800 dark:text-emerald-300">
            <span>TOTAL:</span>
            <span>{formatRupiah(amount)}</span>
          </div>

          {/* Footer & QR */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
            <div className="flex justify-center my-1">
              <QRCodeSVG value={receiptCode} size={64} />
            </div>
            <p className="text-[10px] text-slate-500">
              Terima Kasih - Simpan Struk Ini Sebagai Bukti Sah
            </p>
            <p className="text-[9px] text-slate-400">Koperasi Santri System © {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk (Thermal)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </Modal>
  );
};
