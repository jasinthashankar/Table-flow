import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size] || 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[5px]"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div className={`tf-modal-panel modal-enter relative flex w-full ${sizeClass} flex-col overflow-hidden rounded-2xl`}>
        <div className="tf-modal-header flex items-center justify-between px-6 py-4">
          <div>
            <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-[.16em] text-[#8294ff]">
              TableFlow operation
            </span>
            <h2 id="modal-title" className="mb-0 text-base font-semibold text-white">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="tf-modal-close grid h-9 w-9 place-items-center rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
