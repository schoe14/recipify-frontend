import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#394240]/70 flex items-center justify-center z-[2000] p-4" /* Significantly increased z-index */
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-fadeInScale">
        <div className="text-center mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-[#FF8A65] mx-auto mb-3" /> {/* Soft Coral Icon */}
            <h2 id="confirm-modal-title" className="text-xl sm:text-2xl font-bold text-[#394240] font-['Poppins']">
                {title}
            </h2>
        </div>

        <div className="text-center text-sm sm:text-base text-[#607D8B] mb-6 font-['Roboto'] leading-relaxed">
            {message}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfirm}
            className="flex-grow bg-[#FF8A65] hover:bg-[#F4511E] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins'] shadow-sm"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-grow bg-neutral-200 hover:bg-neutral-300 text-[#394240] font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins']"
          >
            {cancelText}
          </button>
        </div>
        <style>{`
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-fadeInScale {
              animation: fadeInScale 0.3s ease-out forwards;
            }
        `}</style>
      </div>
    </div>
  );
};