import React from 'react';
import { Student } from '../../types';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Printer, QrCode as QrIcon, Building2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StudentAvatar } from '../common/StudentAvatar';

interface SantriQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const SantriQRModal: React.FC<SantriQRModalProps> = ({ isOpen, onClose, student }) => {
  const { settings } = useApp();

  if (!student) return null;

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kartu QR Code Santri" maxWidth="md">
      <div className="flex flex-col items-center">
        {/* Printable ID Card Container */}
        <div
          id="santri-card-printable"
          className="w-full max-w-sm rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-emerald-950 text-white p-6 shadow-2xl border border-emerald-500/30 font-sans"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs tracking-wider uppercase">{settings.pesantren_name}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">{settings.koperasi_name}</p>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
              KARTU DIGITAL
            </span>
          </div>

          {/* Student Body Info */}
          <div className="my-5 flex items-center gap-4">
            <StudentAvatar
              src={student.avatar_url}
              name={student.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-400 shrink-0 shadow-md"
            />
            <div className="space-y-0.5">
              <h4 className="font-bold text-base leading-tight text-white">{student.name}</h4>
              <p className="text-xs font-mono text-emerald-300 font-semibold">{student.nis}</p>
              <p className="text-[11px] text-slate-300">{student.class_name}</p>
              <p className="text-[10px] text-slate-400">{student.dormitory}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-inner">
            <QRCodeSVG value={student.qr_code_data || student.nis} size={130} />
            <span className="font-mono text-[11px] font-bold text-slate-800 mt-2 tracking-widest">
              {student.nis}
            </span>
          </div>

          <p className="text-[9px] text-center text-slate-400 mt-3">
            Pindai QR Code ini di kasir Koperasi Santri untuk transaksi jajan tanpa uang tunai.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full mt-6">
          <button
            onClick={handlePrintCard}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            Cetak Kartu Santri
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
