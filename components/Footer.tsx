
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#80CBC4] text-[#FAFAFA] py-6 text-center"> {/* Mint Fresh BG, Cloud White text */}
      <div className="container mx-auto px-4">
        <p className="text-xs mt-1 font-['Roboto']">
          Recipify &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};
