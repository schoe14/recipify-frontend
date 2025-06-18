
import React, { useEffect, useState } from 'react';
import type { Achievement } from '../types';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Delay onClose to allow fade-out animation
        setTimeout(onClose, 300); 
      }, 5000); // Show for 5 seconds

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement || !isVisible) return null;

  return (
    <div 
      className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 bg-white p-4 rounded-xl shadow-2xl border-l-4 border-[#FF8A65] w-full max-w-sm transform transition-all duration-300 ease-in-out
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl mt-1">{achievement.icon}</span>
        <div className="flex-grow">
          <p className="text-sm font-semibold text-[#394240] font-['Poppins']">Achievement Unlocked!</p>
          <h3 className="text-lg font-bold text-[#00796B] font-['Poppins']">{achievement.name}</h3>
          <p className="text-xs text-[#607D8B] mt-0.5 font-['Roboto']">{achievement.description}</p>
          <p className="text-xs font-bold text-[#00796B] font-['Roboto'] mt-1">+{achievement.xp} XP</p>
        </div>
        <button 
          onClick={() => {setIsVisible(false); setTimeout(onClose, 300);}} 
          className="text-neutral-400 hover:text-neutral-600 p-1 -mt-1 -mr-1"
          aria-label="Close notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
