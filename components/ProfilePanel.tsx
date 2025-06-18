
import React from 'react';
import type { User, UserProgress, Achievement, AchievementId } from '../types';
import { ACHIEVEMENTS_CONFIG } from '../types'; // Assuming it's exported from types

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  progress: UserProgress;
  achievementsConfig: typeof ACHIEVEMENTS_CONFIG;
  onViewedAchievement: (achievementId: AchievementId) => void;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PremiumIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62 3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
  </svg>
);


export const ProfilePanel: React.FC<ProfilePanelProps> = ({ isOpen, onClose, user, progress, achievementsConfig, onViewedAchievement }) => {
  if (!isOpen) return null;

  // Example: Calculate XP for next level (highly simplified)
  const nextLevelXP = Math.floor((progress.xp / 100) + 1) * 100;
  const xpToNextLevelPercentage = Math.min((progress.xp % 100) / 100 * 100, 100);

  const sortedAchievements = Object.values(achievementsConfig).sort((a, b) => {
    const aUnlocked = progress.unlockedAchievementIds.includes(a.id);
    const bUnlocked = progress.unlockedAchievementIds.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return a.xp - b.xp; // Or sort by name, etc.
  });


  return (
    <div 
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="profile-panel-title"
    >
      <div className="fixed inset-0 bg-black/30" onClick={onClose} aria-hidden="true"></div>
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#80CBC4] text-white">
          <h2 id="profile-panel-title" className="text-xl font-semibold font-['Poppins']">Your Profile & Achievements</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close profile panel"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg shadow">
            {user.avatarUrl && (
              <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full border-2 border-[#80CBC4]" />
            )}
            <div>
              <h3 className="text-xl font-semibold text-[#394240] font-['Poppins']">{user.name}</h3>
              <p className="text-sm text-[#607D8B] font-['Roboto']">{user.email}</p>
              {user.isPaid ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#FFECB3] text-[#FF8F00] px-2 py-0.5 rounded-full mt-1">
                  <PremiumIcon className="w-3 h-3" /> Recipify Pro
                </span>
              ) : (
                <span className="text-xs text-[#607D8B] font-['Roboto'] mt-1">Free Plan</span>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-neutral-50 rounded-lg shadow">
              <div className="text-2xl font-bold text-[#00796B] font-['Poppins']">{progress.xp}</div>
              <div className="text-xs text-[#607D8B] font-['Roboto']">Total XP</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg shadow">
              <div className="text-2xl font-bold text-[#00796B] font-['Poppins']">
                🔥 {progress.currentStreak} Day{progress.currentStreak !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-[#607D8B] font-['Roboto']">Cooking Streak</div>
            </div>
          </div>
          {/* XP Bar (Simplified) */}
          <div className="w-full bg-neutral-200 rounded-full h-2.5">
            <div 
              className="bg-[#9CCC65] h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${xpToNextLevelPercentage}%` }}
              title={`${progress.xp % 100} / 100 XP to next (conceptual) level`}
            ></div>
          </div>
          <p className="text-xs text-center text-[#607D8B] font-['Roboto']">
            {100 - (progress.xp % 100)} XP to next level!
          </p>


          {/* Achievements Grid */}
          <div>
            <h4 className="text-lg font-semibold text-[#394240] mb-3 font-['Poppins']">Achievements ({progress.unlockedAchievementIds.length}/{Object.keys(achievementsConfig).length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedAchievements.map(ach => {
                const isUnlocked = progress.unlockedAchievementIds.includes(ach.id);
                const isNew = isUnlocked && !progress.viewedAchievements.includes(ach.id);
                return (
                  <div 
                    key={ach.id}
                    className={`p-3 border rounded-lg shadow-sm flex items-start gap-3 relative overflow-hidden
                                ${isUnlocked ? 'bg-white border-[#9CCC65]' : 'bg-neutral-100 border-neutral-200 opacity-70'}`}
                    title={isUnlocked ? ach.description : ach.unlockHint(progress, ach)}
                    onClick={() => { if (isNew) onViewedAchievement(ach.id); }}
                  >
                    {isNew && (
                        <span className="absolute top-1 right-1 text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-semibold animate-pulse">NEW</span>
                    )}
                    <span className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>{ach.icon}</span>
                    <div>
                      <h5 className={`font-semibold font-['Poppins'] ${isUnlocked ? 'text-[#394240]' : 'text-neutral-500'}`}>{ach.name}</h5>
                      <p className={`text-xs font-['Roboto'] ${isUnlocked ? 'text-[#607D8B]' : 'text-neutral-400'}`}>
                        {isUnlocked ? ach.description : ach.unlockHint(progress, ach)}
                      </p>
                      {isUnlocked && <p className="text-xs font-bold text-[#00796B] font-['Roboto'] mt-0.5">+{ach.xp} XP</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
           {/* Add more sections like settings, stats, etc. later */}
        </div>
      </div>
    </div>
  );
};
