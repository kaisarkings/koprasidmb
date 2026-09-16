import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  hideCloseButton = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Centering Wrapper */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        {/* Modal Dialog */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-header-title"
          className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all z-10 animate-scale-up`}
        >
          {/* Sticky Header with Accessible Close Button */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <div className="min-w-0 flex-1 pr-2">
              <h3
                id="modal-header-title"
                className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate"
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dialog"
                title="Tutup (Esc)"
                className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-90 shrink-0 cursor-pointer shadow-xs"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 max-h-[calc(85vh-4rem)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
