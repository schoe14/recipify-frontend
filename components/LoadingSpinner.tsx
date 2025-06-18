
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 border-4 border-t-[#80CBC4] border-r-[#80CBC4] border-b-[#80CBC4] border-l-[#FAFAFA] rounded-full animate-spin"></div> {/* Mint Fresh, Cloud White */}
      <p className="mt-3 text-[#607D8B] font-['Roboto']">Generating your culinary masterpiece...</p> {/* Slate Gray */}
    </div>
  );
};