
import React from 'react';
import type { UpgradeModalInfo } from '../types';

interface UpgradeModalProps extends UpgradeModalInfo {
  onClose: () => void;
  onUpgrade: () => void; 
}

const PremiumIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62 3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
  </svg>
);

const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 4.5 18.75Z" />
  </svg>
);


export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName,
  limitDetails,
  premiumBenefit,
  onUpgrade,
  onGrantExtra
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#394240]/70 flex items-center justify-center z-[1050] p-4" /* Deep Blueberry overlay, Updated z-index */
      aria-modal="true"
      role="dialog"
      aria-labelledby="upgrade-modal-title"
    >
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-fadeInScale">
        <div className="text-center">
          <PremiumIcon className="w-12 h-12 text-[#FF8A65] mx-auto mb-4" /> {/* Soft Coral icon */}
          <h2 id="upgrade-modal-title" className="text-2xl font-bold text-[#80CBC4] mb-3 font-['Poppins']"> {/* Mint Fresh */}
            Unlock More with Recipify Pro!
          </h2>
          <p className="text-[#607D8B] mb-2 font-['Roboto']"> {/* Slate Gray */}
            You've reached the limit for <strong className="text-[#394240] font-['Poppins']">{featureName.toLowerCase()}</strong>.
          </p>
          <p className="text-sm text-[#607D8B] mb-1 font-['Roboto']">{limitDetails}.</p> {/* Slate Gray */}
          <p className="text-[#394240] font-medium mb-6 font-['Roboto']">{premiumBenefit}.</p> {/* Deep Blueberry */}
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full flex items-center justify-center gap-2 bg-[#FF8A65] hover:bg-[#F4511E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 text-lg font-['Poppins'] shadow-md" /* Soft Coral */
          >
            <PremiumIcon className="w-5 h-5" /> Go Recipify Pro (Simulated)
          </button>
          
          {onGrantExtra && (
            <button
              onClick={onGrantExtra}
              className="w-full flex items-center justify-center gap-2 bg-[#00796B] hover:bg-[#00695C] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 text-sm font-['Poppins'] shadow-sm" /* Darker Teal */
            >
             <FilmIcon /> Watch Ad for 1 Extra (Simulated)
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-neutral-200 hover:bg-neutral-300 text-[#394240] font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 text-sm font-['Poppins']" /* Deep Blueberry text */
          >
            Maybe Later
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
